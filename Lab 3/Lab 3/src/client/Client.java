package client;

import java.io.*;
import java.net.*;
import javax.net.ssl.*;
import java.security.*;
import java.util.StringTokenizer;

public class Client {
    private InetAddress host;
    private int port;
    // This is not a reserved port number
    static final int DEFAULT_PORT = 8189;
    static final String KEYSTORE = "src/client/LIUkeystore.ks";
    static final String TRUSTSTORE = "src/client/LIUtruststore.ks";
    static final String STOREPASSWD = "123456";
    static final String ALIASPASSWD = "123456";

    Client(InetAddress host, int port) {
        this.host = host;
        this.port = port;
    }

    public void run() {
        try {
            KeyStore ks = KeyStore.getInstance("JCEKS");
            ks.load(new FileInputStream(KEYSTORE), STOREPASSWD.toCharArray());

            KeyStore ts = KeyStore.getInstance("JCEKS");
            ts.load(new FileInputStream(TRUSTSTORE), STOREPASSWD.toCharArray());

            KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
            kmf.init(ks, ALIASPASSWD.toCharArray());

            TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
            tmf.init(ts);

            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);
            SSLSocketFactory sslFact = sslContext.getSocketFactory();
            SSLSocket client = (SSLSocket) sslFact.createSocket(host, port);
            client.setEnabledCipherSuites(client.getSupportedCipherSuites());
            System.out.println("\n>>>> SSL/TLS handshake completed");

            BufferedReader socketFromServer;
            socketFromServer = new BufferedReader(new InputStreamReader(client.getInputStream()));
            PrintWriter socketToServer = new PrintWriter(client.getOutputStream(), true);

            printMenu();

            String input = new BufferedReader(new InputStreamReader(System.in)).readLine();
            int option = Integer.parseInt(input);

            switch (option) {
                case 1:
                    System.out.println("Enter filename: ");
                    try {
                        String filename = new BufferedReader(new InputStreamReader(System.in)).readLine();
                        String line;
                        String text = "";

                        try (FileReader fileReader = new FileReader(filename);
                                BufferedReader bufferedReader = new BufferedReader(fileReader)) {

                            while ((line = bufferedReader.readLine()) != null) {
                                text += line;
                            }

                            System.out.println(text);
                        } catch (IOException e) {
                            System.err.println("Error reading the file: " + e.getMessage());
                        }
                    } catch (Exception e) {
                        System.out.println(e);
                    }
                    break;
                case 2:
                    try {

                    } catch (Exception e) {
                        System.out.println(e);
                    }
                    break;
                case 3:
                    try {

                    } catch (Exception e) {
                        System.out.println(e);
                    }
                    break;
                default:
                    break;
            }

        } catch (Exception e) {
            System.out.println("Client error: " + e);
        }
    }

    public void printMenu() {
        System.out.println("Please choose an option: ");
        System.out.println("1. Upload file. ");
        System.out.println("2. Download file. ");
        System.out.println("3. Delete file. ");
    }

    public void upload(String filename, String data) {

    }

    public String download() {

        return "";
    }

    public void delete(String filename) {

    }

    // Client's main
    public static void main(String[] args) throws Exception {
        try {
            InetAddress host = InetAddress.getLocalHost();
            int port = DEFAULT_PORT;
            if (args.length > 0) {
                port = Integer.parseInt(args[0]);
            }
            if (args.length > 1) {
                host = InetAddress.getByName(args[1]);
            }
            Client client = new Client(host, port);
            client.run();
        } catch (UnknownHostException uhx) {
            System.out.println(uhx);
            uhx.printStackTrace();
        }
    }
}
