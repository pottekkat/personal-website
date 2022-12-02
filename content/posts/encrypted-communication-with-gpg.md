---
title: "Signed Commits and Encrypted Communication with GPG Keys"
date: 2022-12-02T10:04:40+05:30
draft: false
weight: 8
ShowToc: true
TocOpen: true
summary: "Exploring how symmetric-key and public-key cryptography works by using GPG keys to sign commits and send encrypted messages."
tags: ["security", "tutorial", "communication"]
categories: ["Tutorials"]
mermaid: true
cover:
    image: "/images/encrypted-communication-with-gpg/kids-whisper-banner.jpeg"
    alt: "Kids whispering while playing sports."
    caption: "Photo by [cottonbro studio](https://www.pexels.com/photo/kids-in-active-wear-engaged-in-sports-9654720/)"
    relative: false
---

GNU Privacy Guard, also known as GPG, is a popular open source software for secure communication.

I have been using GPG keys recently to sign my commits and for encrypted messages.

In this article, I will explain GPG keys, how they work, and how you can use them.

## What is GPG?

GPG is an implementation of OpenPGP, a standard for authenticating or encrypting data using public key cryptography.

A user will have a public key that they can share with anyone and a private key that should be secret. You can use the private key to sign or decrypt messages, while others will use you public key to verify your signature or encrypt messages.

To send you a confidential message, anyone can use your public key, encrypt the message, and send it to you. You can read it after decrypting it with your private key.

{{< mermaid >}}
flowchart TB
m("👥 Confidential message") --> |"🔐 Encrypt (Public key)"| em(Encrypted message) --> |"🗝️ Decrypt (Private key)"| dm("👨🏽 Decrypted/Original message")
style em stroke: red
style dm stroke: green
{{< /mermaid >}}

You can also sign your messages with your private key, and others can verify your signature with your public key.

{{< mermaid >}}
flowchart TB
sm("👨🏽 Sensitive message") --> |"🖊️ Sign (Private key)"| sms("🔏 Sensitive message + signature") --> |"👥 Verify (Public key)"| v("👥 Verified message")
style sms stroke: green
{{< /mermaid >}}

## Installing GPG

You can download and install GPG from the [official website](https://www.gnupg.org/download/) if it isn't already installed.

To check if it is installed properly, run:

```shell
gpg -h
```

## Generating a New GPG Key Pair

You can create a new key pair by running:

```shell
gpg --full-generate-key
```

It will prompt you several times to configure your keys:

* **Kind**: RSA and RSA (default)
* **Size**: > `4096` (for signing commits)
* **Validity**: Could be days, weeks, months, or years. For example, `1y` will set it to one year.
* **Name, email, and comment**: This email and name will be associated with your signature.
* **Passphrase**: Secure passphrase to unlock the private key. Make it strong. Use a password generator if possible.

Once you complete all the prompts, `gpg` will generate a key pair.

> **Tip**: As `gpg` uses entropy to generate the key pair, it will depend on how active your system is. To generate more entropy, you can use something like [rng-tools](https://www.devmanuals.net/install/ubuntu/ubuntu-12-04-lts-precise-pangolin/install-rng-tools.html).

To verify whether the key pair was created, you can run:

```shell
gpg --list-keys
```

### Generating a Revocation Certificate

A revocation certificate can invalidate your public key if you forget your passphrase or compromise your private key.

You should generate this as soon as you create a key pair and store it in a separate location.

To generate a revocation certificate, run:

```shell
gpg --output ~/revocation.crt --gen-revoke your-email@your-provider.com
```

When you revoke a public key, people can no longer use it to send encrypted messages to you. But it can still verify your past signatures and decrypt past messages.

### Exporting Your Public Key

To use GPG keys, you must export your public key. In an [upcoming section](#encrypting-messages), I will discuss how you can share the exported key with others in a public keyserver.

To export your key, run:

```shell
gpg --armor --export your-email@your-provider.com
```

You can also export it to a file by running:

```shell
gpg --output ~/public.key --armor --export your-email@your-provider.com
```

## Signing Commits with Your GPG Key Pair

All of my projects and the projects I contribute to are on GitHub. If you are using other platforms like GitLab, you can follow their [official documentation](https://docs.gitlab.com/ee/user/project/repository/gpg_signed_commits/#add-a-gpg-key-to-your-account).

> **Note**: The email associated with your GPG key should match a verified email configured in your GitHub account.

On GitHub, go to "Settings" > "Access" > "SSH and GPG keys" > "New GPG key".

{{< figure src="/images/encrypted-communication-with-gpg/ssh-and-gpg-keys.png#center" title="Configuring public key on GitHub" caption="This will be used to verify our signature on commits" link="/images/encrypted-communication-with-gpg/ssh-and-gpg-keys.png" target="_blank" class="align-center" >}}

In the "Key" field, paste the public key you exported from `-----BEGIN PGP PUBLIC KEY BLOCK-----` to `-----END PGP PUBLIC KEY BLOCK-----` including both.

Click "Add GPG key" and enter your password to confirm.

Next, you have to configure Git to use your created GPG private key to sign your commits.

First, find the long form of your key ID by running:

```shell
gpg --list-secret-keys --keyid-format=long
```

```text {title="output"}
/Users/user1/.gnupg/pubring.kbx
---------------------------------
sec  rsa4096/3AA5C34371567BD2 2022-10-12 [SC]
   29D5E24EA8EF21FD70A8F2D3B33049A4551D
uid         [ultimate] Firstname Lastname (comment) <your-email@your-provider.org>
ssb  rsa4096/4BB6D45482678BE3 2022-10-12 [E]
```

In this example, the key ID is `3AA5C34371567BD2`.

Now, use this key ID to configure Git:

```shell
git config --global user.signingkey 3AA5C34371567BD2
```

> **Tip**: To sign all commits by default, run:
> ```shell
> git config --global commit.gpgsign true
> ```

Now, when you commit, use the `-S` flag. You should also be able to configure your IDE to do this for you automatically for every commit.

If you push these commits to GitHub, you will see that they are verified using your public key.

{{< figure src="/images/encrypted-communication-with-gpg/verified-commits.png#center" title="Verified commits" caption="All my commits are verified now" link="/images/encrypted-communication-with-gpg/verified-commits.png" target="_blank" class="align-center" >}}

## Sending Encrypted Messages with Your GPG Key Pair

### Encrypting Messages

Anyone can use your public key to send encrypted messages to you. But first, you have to make your public key, well, public.

You can copy your public key and share it with people who want to send you encrypted messages. I have [shared my public key on my website](/about/#gpg-key), and people can copy it and use it to encrypt messages.

You can also upload your key to a public key server like `pgp.mit.edu`:

```shell
gpg --send-keys --keyserver pgp.mit.edu 3AA5C34371567BD2
```

> **Note**: `3AA5C34371567BD2` is the key ID. Replace it with your key ID.

Now, anyone will be able to request your public key from the key server with the command:

```shell
gpg --recv-keys keyid
```

To encrypt messages, get the public key of the person you are sending the message to. Make sure to add yourself as a recipient if you want to decrypt the message in the future:

```shell
gpg --encrypt --sign --armor -r receiver-email@receiver-provider.com -r sender-email@sender-provider.com name-of-file
```

This will create a `.asc` file containing your encrypted message.

### Decrypting Messages

To decrypt a message, you can run `gpg`, and it will prompt you as necessary:

```shell
gpg name-of-file.asc
```

This will create a new file with the decrypted message.

You can also configure your email clients or other applications to use this key pair for encrypted communication. I use the Thunderbird email client, and its [documentation](https://support.mozilla.org/en-US/kb/openpgp-thunderbird-howto-and-faq#:~:text=To%20use%20OpenPGP%20functionality%20in,copy%20of%20your%20existing%20key.) explains how you can configure your GPG key.

---

That's it! I'm not a security or cryptography expert, but I will probably look into where I can use these keys next.

I will write a new article or update this when I do so.
