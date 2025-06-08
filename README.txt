This project is built to run on a Raspberry Pi Model B Rev 2 with the following hardware specs:

- Processor: ARMv6-compatible processor rev 7 (v6l)

- CPU Architecture: ARMv6 (architecture 7)

- Hardware: BCM2835

- CPU Features: half thumb fastmult vfp edsp java tls

- BogoMIPS: 697.95

The project uses Node.js v10.24.1 and npm v6.14.12.
Operating system is Raspberry PI OS LITE (32-BIT)


System Setup Instructions
	Update and upgrade system packages:
	- sudo apt update && sudo apt upgrade -y
	Install essential tools:
	- sudo apt install curl git build-essential -y
	Install NVM (Node Version Manager):
	- curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
	export NVM_DIR="$HOME/.nvm"
	[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
	Install Node.js v10:
	- nvm install 10

PostgreSQL Setup
Install PostgreSQL and contrib packages:
- sudo apt install postgresql postgresql-contrib -y
Enable and start PostgreSQL service:
- sudo systemctl enable postgresql
- sudo systemctl start PostgreSQL

Create database user and database:

sudo -u postgres psql
CREATE USER piuser WITH PASSWORD 'securepass';
CREATE DATABASE pidb;
GRANT ALL PRIVILEGES ON DATABASE pidb TO piuser;
\q

Create required tables:

CREATE TABLE IF NOT EXISTS BlacklistedTokens (
  Token TEXT PRIMARY KEY,
  ExpiryDate TIMESTAMP NOT NULL
);


CREATE TABLE Users (
  Name VARCHAR(255) PRIMARY KEY,
  PasswordHash TEXT NOT NULL,
  Role VARCHAR(50),
  IsMfaEnabled BOOLEAN DEFAULT FALSE,
  MfaSecret TEXT,
  DeviceHash TEXT
);

CREATE TABLE BlacklistedTokens (
  Token TEXT PRIMARY KEY,
  ExpiryDate TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS Messages (
  FromUserId VARCHAR(255),
  ToUserId VARCHAR(255),
  CipherText TEXT,
  Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


Project Setup:

npm install

VPN Setup with Tailscale:
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
Visit the provided tailscale URL to authenticate your device

Create certifications for your own Raspberry Pi by using:
openssl req -nodes -new -x509 -keyout certs/key.pem -out certs/cert.pem -days 365
Use your Raspberry pi Tailscale IP address in the htmlConfig.js file.

Notes:
- The app is designed to work within a VPN for a small number of users.
- Node.js version 10 is used due to hardware limitations on the Raspberry Pi Model B Rev 2.
- The app is using jsonwebtoken version 8.5.1 as newer versions seem to be incompatible with Node.js v10.
