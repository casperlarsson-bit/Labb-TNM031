import java.math.BigInteger;

public class Sender {
    public BigInteger encryptMessage(String input, BigInteger e, BigInteger n) {
        BigInteger m = new BigInteger(input.getBytes());

        return m.modPow(e, n);
    }
}