const express = require("express");
const ldapjs = require("ldapjs");
const { BerWriter } = require("asn1");
const { execFile } = require("child_process");


const app = express();
app.use(express.json());


const LLDAP_BASE = process.env.LLDAP_BASE || "http://lldap:17170";
const LLDAP_ADMIN_USER = process.env.LLDAP_ADMIN_USER || "admin";
const LLDAP_ADMIN_PASS = process.env.LLDAP_ADMIN_PASS || "SuperSecretAdminPass123";

const LLDAP_LDAP_URL = process.env.LLDAP_LDAP_URL || "ldap://lldap:3890";
const LLDAP_BASE_DN = process.env.LLDAP_BASE_DN || "dc=localtest,dc=me";

const LLDAP_PEOPLE_OU = process.env.LLDAP_PEOPLE_OU || "ou=people";

const LLDAP_ADMIN_BIND_DN =
  process.env.LLDAP_ADMIN_BIND_DN || `uid=${LLDAP_ADMIN_USER},${LLDAP_PEOPLE_OU},${LLDAP_BASE_DN}`;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setPasswordWithLdappasswd({ userId, newPassword }) {
  const adminDn = `uid=${process.env.LLDAP_ADMIN_USER || "admin"},ou=people,${process.env.LLDAP_BASE_DN || "dc=localtest,dc=me"}`;
  const adminPass = process.env.LLDAP_ADMIN_PASS || "SuperSecretAdminPass123";
  const baseDn = process.env.LLDAP_BASE_DN || "dc=localtest,dc=me";
  const ldapUrl = process.env.LLDAP_LDAP_URL || "ldap://lldap:3890";
  const userDn = `uid=${userId},ou=people,${baseDn}`;

  return new Promise((resolve, reject) => {
    execFile(
      "ldappasswd",
      ["-x", "-H", ldapUrl, "-D", adminDn, "-w", adminPass, "-s", newPassword, userDn],
      { timeout: 15000 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(`ldappasswd failed: ${stderr || err.message}`));
        resolve(true);
      }
    );
  });
}

async function lldapLogin() {
  const res = await fetch(`${LLDAP_BASE}/auth/simple/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: LLDAP_ADMIN_USER, password: LLDAP_ADMIN_PASS }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`LLDAP admin login failed (${res.status}): ${txt}`);
  }

  const json = await res.json();
  if (!json?.token) throw new Error("LLDAP login did not return a token");
  return json.token;
}

async function lldapGraphQL(token, query, variables) {
  const res = await fetch(`${LLDAP_BASE}/api/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`LLDAP GraphQL HTTP ${res.status}: ${JSON.stringify(json)}`);
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}


function encodePasswordModifyRequest({ userDn, newPassword }) {
  const writer = new BerWriter();
  writer.startSequence();

  writer.writeString(userDn, 0x80);

  writer.writeString(newPassword, 0x82);

  writer.endSequence();
  return writer.buffer;
}




app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body || {};

    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ ok: false, message: "Missing fields." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email." });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ ok: false, message: "Password must be at least 8 characters." });
    }

    const token = await lldapLogin();

    const createUserMutation = `
      mutation CreateUser($user: CreateUserInput!) {
        createUser(user: $user) { id }
      }
    `;

    await lldapGraphQL(token, createUserMutation, {
      user: {
        id: username, 
        email,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
      },
    });

   await setPasswordWithLdappasswd({ userId: username, newPassword: password });

    return res.json({ ok: true });
  } catch (err) {
    const msg = String(err?.message || err);

    if (msg.includes("UNIQUE constraint failed: users.lowercase_email")) {
      return res.status(409).json({ ok: false, message: "Email already in use." });
    }

    return res.status(400).json({ ok: false, message: msg });
  }
});

app.listen(3000, () => {
  console.log("BFF listening on http://0.0.0.0:3000");
});
