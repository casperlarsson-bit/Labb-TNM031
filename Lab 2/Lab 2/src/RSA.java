/*
 * The RSA Algorithm
 * 1. Bob chooses secret primes p and q and computes n =pq.
 * 2. Bob chooses e with gcd(e, (p - l)(q - 1)) = 1.
 * 3. Bob computes d with de .1 (mod (p - l)(q - 1)).
 * 4. Bob makes n and e public, and keeps p, q,d secret.
 * 5. Alice encrypts m as c = me (mod n) and sends c to Bob.
 * 6. Bob decrypts by computing m = cd (mod n)
 */

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;

public class RSA {
    public static void main(String[] args) throws Exception {
        // Creats two persons
        Person bob = new Person();
        Person alice = new Person();

        // Generates keys
        bob.generateKeys();
        alice.generateKeys();

        System.out.println("Connecting...\nConnection complete.\n");
        // ================================================================================================================

        String messageAlice = "Alice: A top secret message";

        // Alice encryptes a message with Bobs public keys
        BigInteger encryptedMessageFromAlice = alice.encryptMessage(messageAlice, bob.getE(), bob.getN());

        System.out.println("Encrypted message from Alice: " + new String(encryptedMessageFromAlice.toByteArray()) + "\n");

        // Bob decryptes (using his private keys) Alice messege and prints it out
        System.out.println("Decrypted message: " + bob.decryptMessage(encryptedMessageFromAlice) + "\n");

        // ================================================================================================================
        
        
        //String messageBob = "Bob: Roger roger";
        System.out.print("Your response: ");
        String messageBob = (new BufferedReader(new InputStreamReader(System.in))).readLine();
        
        // Bob encryptes a message with Bobs public keys
        BigInteger encryptedMessageFromBob = bob.encryptMessage(messageBob, alice.getE(), alice.getN());

        System.out.println("\nEncrypted message from Bob: " + new String(encryptedMessageFromBob.toByteArray()) + "\n");

        // Alice decryptes (using his private keys) Bobs messege and prints it out
        System.out.println("Decrypted message: " + alice.decryptMessage(encryptedMessageFromBob) + "\n");
        System.out.println("Communication terminated.\n");
    }
}