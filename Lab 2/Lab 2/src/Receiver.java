import java.math.BigInteger;

public class Receiver {

    private BigInteger p;
    private BigInteger q;
    private BigInteger d;
    public BigInteger n;
    public BigInteger e;

    public void  generateKeys() {
        RandomPrimeGenerator primeGenerator = new RandomPrimeGenerator();
        p = primeGenerator.generateRandomPrime(1024);
        q = primeGenerator.generateRandomPrime(1024);

        generateE();
        generateD();   
        
        n = p.multiply(q);
    }

    private void generateE() {
        // gcd(e, (p - l)(q - 1)) = 1

        e = BigInteger.valueOf(2);
        BigInteger phi = (p.subtract(BigInteger.ONE)).multiply(q.subtract(BigInteger.ONE));

        while (e.compareTo(phi) < 0) {
            if (e.gcd(phi).compareTo(BigInteger.ONE) == 0) {
                return;
            }

            e = e.add(BigInteger.ONE);
        }
        System.out.println("Sadly, there is no possible e\n");

    }

     private void generateD() {
        // @TODO Förstå
        BigInteger phi = (p.subtract(BigInteger.ONE)).multiply(q.subtract(BigInteger.ONE));

        d = e.modInverse(phi);
    }

    public BigInteger getE() {
        return e;
    }

    
    public BigInteger getD() {
        return d;
    }

    public String decryptMessage(BigInteger c) {
        BigInteger m = c.modPow(d, n);
        return new String(m.toByteArray());
    }
    
}