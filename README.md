# POC FIDO2 / WebAuthn cu server open-source (Kanidm) – macOS

  ## Introducere
  
Acest proiect implementează un Proof of Concept (POC) pentru autentificare modernă folosind FIDO2 / WebAuthn, bazat pe un server open-source (Kanidm).
Scopul este demonstrarea unui flux de autentificare passwordless, utilizând un passkey / token FIDO2, configurat local pe macOS.
Proiectul este educațional și demonstrează:
separarea autentificării de aplicațiile web
utilizarea standardelor moderne de securitate
autentificare hardware, rezistentă la phishing

 ## Obiectivele proiectului
 
Instalarea și configurarea unui server de identitate open-source
Activarea autentificării FIDO2 / WebAuthn
Eliminarea parolelor clasice
Demonstrarea funcționării pe macOS, local, cu HTTPS

  ## Concepte teoretice cheie
  
FIDO2 / WebAuthn
FIDO2 este un standard deschis pentru autentificare sigură, bazat pe criptografie asimetrică.
Cheia privată este generată și stocată exclusiv în hardware (token sau Secure Enclave), iar serverul păstrează doar cheia publică.
Kanidm
Kanidm este un Identity Provider (IdP) open-source care:
gestionează utilizatori
gestionează credențiale
implementează WebAuthn / FIDO2
poate fi integrat cu aplicații web prin OIDC
De ce HTTPS
WebAuthn funcționează doar în context securizat (HTTPS).
Browserul și tokenul verifică strict origin-ul (protocol + domeniu + port).

  ## Arhitectură
  
        [ Browser ]
             |
             v
        [ Kanidm (IdP) ]
             |
         (WebAuthn / FIDO2)
             |
             v
        [ Token FIDO2 / Passkey ]

  ## Tehnologii utilizate
  
- Kanidm (open-source IdM)
- FIDO2 / WebAuthn
- Docker & Docker Compose
- mkcert (certificate TLS locale)
- macOS
- HTTPS local

  ## Structura proiectului
  
        fido-lab/
        ├── certs/
        │   ├── local.crt
        │   └── local.key
        ├── kanidm/
        │   └── server.toml
        ├── docker-compose.yml
        └── README.md

  ## Cerințe
  
- macOS
- Docker Desktop
- Homebrew
- Browser modern (Safari / Chrome / Firefox)
- Token FIDO2 hardware (opțional – se poate folosi Touch ID)

  ## Implementare – pas cu pas
  
1. Instalare HTTPS local (mkcert)
     
     WebAuthn necesită HTTPS chiar și în mediul local.

             brew install mkcert
             brew install nss
             mkcert -install

     Explicație:
     Se creează o autoritate de certificare locală, recunoscută de sistem și browser.

2. Crearea structurii proiectului
     
                mkdir -p ~/fido-lab/{certs,kanidm}
                cd ~/fido-lab

3. Generarea certificatelor TLS
     
                mkcert -cert-file certs/local.crt -key-file certs/local.key \
                id.localtest.me app.localtest.me
        
     Explicație: Certificatul este folosit de Kanidm pentru HTTPS.

4. Configurarea Kanidm
     
     Fișier: kanidm/server.toml
     
                domain = "id.localtest.me"
                origin = "https://id.localtest.me:8443"
        
                bindaddress = "[::]:8443"
        
                db_path = "/data/kanidm.db"
        
                tls_chain = "/certs/local.crt"
                tls_key = "/certs/local.key"
        
     Explicație:
       - domain = Relying Party ID (pentru WebAuthn)
       - origin = URL exact folosit în browser
       - TLS este configurat direct în Kanidm

 5. Pornirea Kanidm cu Docker
    
    Fișier: docker-compose.yml

            services:
                  kanidm:
                    image: kanidm/server:latest
                    command: ["/sbin/kanidmd", "server", "-c", "/etc/kanidm/server.toml"]
                    ports:
                      - "8443:8443"
                    volumes:
                      - kanidm_data:/data
                      - ./kanidm/server.toml:/etc/kanidm/server.toml:ro
                      - ./certs:/certs:ro
                
             volumes:
                  kanidm_data:

    Pornire:

            docker compose up -d

    Acces:

            https://id.localtest.me:8443

 6. Inițializare conturi administrative
    
    Kanidm separă identitățile de credențiale.
    
        docker compose exec kanidm \
          kanidmd -c /etc/kanidm/server.toml recover-account admin
        docker compose exec kanidm \
          kanidmd -c /etc/kanidm/server.toml recover-account idm_admin

    Explicație: idm_admin este contul folosit pentru administrarea identităților.

  7. Crearea utilizatorului de test
     
              kanidm person create alice "Alice"
      Utilizatorul este creat fără parolă inițială (best practice).

  8. Inițializarea credentialelor
      
      Pentru prima autentificare:
      
              docker compose exec kanidm \
              kanidmd -c /etc/kanidm/server.toml recover-account alice
      
      Aceasta generează o parolă temporară.

  9. Autentificare inițială

      - Login ca alice
      - Schimbarea parolei este cerută automat

  10. Înrolarea passkey-ului (FIDO2)
      
      - Login ca alice
      - Profile → Credentials
      - Add Passkey
      - Confirmare Touch ID sau token FIDO2
              
      Explicație: Tokenul generează o pereche de chei criptografice legată de origin.

  11. Eliminarea parolei
      
      După înrolarea passkey-ului: se șterge parola generată, autentificarea devine 100% passwordless

  12. Test final
      
      - Logout
      - Login
      - Browserul cere doar passkey 
      - Autentificare reușită


## Rezultat final

- Autentificare fără parolă
- Credential FIDO2 funcțional
- Server open-source configurat corect
- Flux complet WebAuthn
