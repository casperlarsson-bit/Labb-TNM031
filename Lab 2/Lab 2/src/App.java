/*
To be approved on this lab, you must demonstrate and explain your program during a lab
session, or book a time with Igor.

RSA implementation in Java

Write an implementation of the RSA algorithm in java.
Your program must have the following functionalities. It must be able to,

- generate public and private keys.
- encrypt a plain text message given one key.
- decrypt the ciphertext message given the other key.

Your program has be commented in a clear and informative way.
Tip: Have a look at the Java class BigInteger in the package java.math at
http://docs.oracle.com/javase/8/docs/api/
 */

import java.math.BigInteger;

public class App {
    public static void main(String[] args) throws Exception {
        //RandomPrimeGenerator primeGenerator = new RandomPrimeGenerator();
        //BigInteger test = primeGenerator.generateRandomPrime(1024);
        //System.out.println(test);
        Receiver bob = new Receiver();
        bob.generateKeys();

        Sender alice = new Sender();
        String message = "Ett hemligt meddelande";
        BigInteger encryptedMessage = alice.encryptMessage(message, bob.getE(), bob.getD());
        
        System.out.println("\nMessage: " + message);        
        System.out.println("Encrypted message: " + encryptedMessage.toByteArray());        
        
        System.out.println("Decrypted message: " + bob.decryptMessage(encryptedMessage) + "\n");        
    }

}

/*
 * The RSA Algorithm
 * 1. Bob chooses secret primes p and q and computes n =pq.
 * 2. Bob chooses e with gcd(e, (p - l)(q - 1)) = 1.
 * 3. Bob computes d with de .1 (mod (p - l)(q - 1)).
 * 4. Bob makes n and e public, and keeps p, q,d secret.
 * 5. Alice encrypts m as c = me (mod n) and sends c to Bob.
 * 6. Bob decrypts by computing m = cd (mod n)
 */