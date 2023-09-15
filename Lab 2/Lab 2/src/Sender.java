import java.math.BigInteger;

public class Sender { 
    public BigInteger encryptMessage(String input, BigInteger n, BigInteger e) {
        BigInteger m = new BigInteger(input.getBytes());

        return m.modPow(e, n);
    }
}