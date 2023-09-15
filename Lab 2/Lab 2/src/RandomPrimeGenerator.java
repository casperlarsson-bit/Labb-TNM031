import java.math.BigInteger;
import java.util.Random;

public class RandomPrimeGenerator {

    // Generate a random prime number with the given bit length as argument
    public BigInteger generateRandomPrime(int bitLength) {

        // Declare relevent variables
        BigInteger prime;
        Random random = new Random();

        // Continue until prime is actual a prime number
        do {
            // Generate a random number with the given bit length
            prime = new BigInteger(bitLength, random);

            // Make prime odd, always
            prime = prime.setBit(0);

        } while (!isPrime(prime));

        // Return the prime number
        return prime;
    }

    private static Boolean isPrime(BigInteger num) {
        // Return false if num is smaller or equal to 1
        if (num.compareTo(BigInteger.ONE) <= 0) {
            return false;
        }
        // 100% certainty it is a prime number
        return num.isProbablePrime(100);
    }
}
