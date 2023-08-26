# HelixRUN Installation Guide

Welcome to the HelixRUN installation guide! This document will guide you through the steps 
required to set up the project on your machine. Let's get started.

## Prerequisites

Before you begin, ensure that you have:

- [Node.js](https://nodejs.org/) (preferably the latest LTS version)
- [npm](https://www.npmjs.com/) (which comes bundled with Node.js)
- [Git](https://git-scm.com/)

## Step 1: Clone the Repository

Clone the HelixRUN repository to your local machine:

```bash
git clone https://github.com/domthewop/helixrun.git
cd helixrun
```

## Step 2: Install Dependencies

Inside the project directory, install the required npm packages:

```bash
npm install
```

## Step 3: Configure Environment

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Now, edit the `.env` file to set up your local environment variables. This includes database 
credentials, API keys, and other configuration values.

## Optional: Setting Up PostgreSQL

If you wish to run PostgreSQL locally, follow the steps below. Alternatively, you can use a 
remote PostgreSQL instance or a managed database service.

### 1. Install PostgreSQL on Ubuntu 22.04:

1. Update your package repositories:

```bash
sudo apt update
```

2. Install PostgreSQL:

```bash
sudo apt install postgresql postgresql-contrib
```

### 2. Setup PostgreSQL:

1. Switch to the PostgreSQL system user:

```bash
sudo -i -u postgres
```

2. Enter the PostgreSQL shell:

```bash
psql
```

3. Set a password for the `postgres` user:

```sql
\password postgres
```

Enter a strong password and confirm it.

4. Create a database for HelixRUN:

```sql
CREATE DATABASE helixrun_db;
```

5. Install the `uuid-ossp` extension:

```sql
CREATE EXTENSION "uuid-ossp";
```

Exit the shell:

```sql
\q
```

Now, return to your regular user:

```bash
exit
```

Update your `.env` file with the database connection details:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost/helixrun_db
```

Replace `YOUR_PASSWORD` with the password you set earlier.

---

That's it! You've now successfully set up HelixRUN on your machine. Head over to the [SETUP.md](./SETUP.md) for further instructions on running and using the project. If you encounter any issues, please refer to the documentation or raise an issue on GitHub.
