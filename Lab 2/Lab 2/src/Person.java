import java.math.BigInteger;

// Class Person which stores private and public keys
public class Person {
    // Private keys
    private BigInteger p;
    private BigInteger q;
    private BigInteger d;

    // Public keys
    public BigInteger n;
    public BigInteger e;

    private BigInteger phi;

    // Generate private and public keys for this person
    public void generateKeys() {
        // Creat an instant of a prime generator
        RandomPrimeGenerator primeGenerator = new RandomPrimeGenerator();

        // Gets a randome primenumber as a BigInteger
        p = primeGenerator.generateRandomPrime(1024);
        q = primeGenerator.generateRandomPrime(1024);

        // Calculate phi to be used for e and d
        phi = (p.subtract(BigInteger.ONE)).multiply(q.subtract(BigInteger.ONE)); // phi = (q-1)(p-1)

        // Creat n
        n = p.multiply(q);

        // Calculate the public key e, and the private key d
        generateE();
        generateD();
    }

    private void generateE() {
        // gcd(e, (p - l)(q - 1)) = 1, meaning the gcd is 1

        e = BigInteger.valueOf(2); // The min possible value for e

        // Loop through e until it satisfies equation above
        while (e.compareTo(phi) < 0) {
            if (e.gcd(phi).compareTo(BigInteger.ONE) == 0) {
                // e satisfies equation, return
                return;
            }

            // Increment e with 1
            e = e.add(BigInteger.ONE);
        }
        // Sould never occure
        System.out.println("There is no possible e\n");
    }

    // Generate the public key d, d*e % ((p - l)(q - 1)) = 1
    private void generateD() {
        d = e.modInverse(phi);
    }

    // Get e as public key
    public BigInteger getE() {
        return e;
    }

    // Get n as public key
    public BigInteger getN() {
        return n;
    }

    // Decrypts message by calcylating m, m % n = c^d
    public String decryptMessage(BigInteger c) {
        BigInteger m = c.modPow(d, n);
        return new String(m.toByteArray());
    }

    // Encrypt the message using the public keys from the other user
    public BigInteger encryptMessage(String input, BigInteger e, BigInteger n) {
        BigInteger m = new BigInteger(input.getBytes());
        return m.modPow(e, n);
    }
}
