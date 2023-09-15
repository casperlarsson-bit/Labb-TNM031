import java.math.BigInteger;
import java.util.Random;

public class RandomPrimeGenerator {

    public BigInteger generateRandomPrime() {

        int number = 0;
        Random random = new Random();
        Boolean isPrime = false;
        number = random.nextInt(1000) + 1;
        System.out.println(number);

        // prime = new Biginter(bitLength, random)

        while (isPrime) {

        }

        return new BigInteger("0");
    }

    public Boolean isPrime(BigInteger num) {
        // compareTo returns:
        // -1 if left is smallar than arg
        // 0 if they are equal
        // 1 if left is larger than arg
        // if (num <= 3 || num % 2 == 0)
        // return num == 3 || num == 2
         if (num.compareTo(BigInteger.valueOf(3)) < 0 || num.mod(BigInteger.valueOf(2)).compareTo(BigInteger.valueOf(0)) == 0) {
            return num == BigInteger.valueOf(2) || num == BigInteger.valueOf(3);
        }
        return true;
    }
}
