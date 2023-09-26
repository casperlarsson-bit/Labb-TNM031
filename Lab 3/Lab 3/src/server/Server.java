package server;

import java.io.*;
import java.security.KeyStore;
import javax.net.ssl.*;

public class Server {
    private int port;
    static final int DEFAULT_PORT = 8189;
    static final String KEYSTORE = "src/server/LIUkeystore.ks";
    static final String TRUSTSTORE = "src/server/LIUtruststore.ks";
    static final String STOREPASSWD = "123456";
    static final String ALIASPASSWD = "123456";

    // Constructor to initialize the server with a specific port
    Server(int port) {
        this.port = port;
    }

    // Method to start the server
    public void start() {
        try {
            // Load the server's keystore and truststore
            // Used to to store cryptographic keys and certificates
            KeyStore ks = KeyStore.getInstance("JCEKS");// Java Cryptography Extension Key Store
            ks.load(new FileInputStream(KEYSTORE), STOREPASSWD.toCharArray());
            KeyStore ts = KeyStore.getInstance("JCEKS");
            ts.load(new FileInputStream(TRUSTSTORE), STOREPASSWD.toCharArray());

            // Initialize KeyManagerFactory with the server keystore
            // Used to manage key material for the servers SSL/TLS context.
            KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509"); // X.509 certificate based key manager
            kmf.init(ks, ALIASPASSWD.toCharArray());

            // Initialize TrustManagerFactory with the truststore
            // Determines whether a remote party's cartificate should be trusted
            TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
            tmf.init(ts);

            // Create and configure an SSL context for secure communication
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);// Uses kmf and tmf here

            // Create an SSLServerSocketFactory from the SSL context
            SSLServerSocketFactory sslServerFactory = sslContext.getServerSocketFactory();

            // Create and configure the SSLServerSocket
            SSLServerSocket sss = (SSLServerSocket) sslServerFactory.createServerSocket(port);
            // =========================================
            // Forces client authentication
            sss.setNeedClientAuth(true);
            // =========================================
            sss.setEnabledCipherSuites(sss.getSupportedCipherSuites());

            // Wait for an incoming SSL/TLS connection from a client
            SSLSocket incoming = (SSLSocket) sss.accept();

            // Create input and output streams for communication with the client thourgh the
            // socket (securely)
            BufferedReader socketFromClient = new BufferedReader(new InputStreamReader(incoming.getInputStream()));
            PrintWriter socketToClient = new PrintWriter(incoming.getOutputStream(), true);

            System.out.println("Server is running...\n");
            int option;
            do {
                // Read the user's menu choice sent by the client
                String input = socketFromClient.readLine();
                option = Integer.parseInt(input);

                switch (option) {
                    case 1:
                        // File upload to server option
                        System.out.println("Server waiting for upload...");
                        try {
                            String filename = socketFromClient.readLine();
                            System.out.println("Filename: " + filename);
                            String data = socketFromClient.readLine();
                            upload(filename, data);
                        } catch (Exception e) {
                            System.out.println("Error in uploding file: " + e);
                        }
                        break;
                    case 2:
                        // File download from server option
                        try {
                            System.out.println("Server waiting for filename to send...");
                            String filename = socketFromClient.readLine();
                            String data = getFileData(filename);
                            socketToClient.println(data);
                            System.out.println("File named " + filename + ", successfully sent.");
                        } catch (Exception e) {
                            System.out.println(e);
                        }
                        break;
                    case 3:
                        // File deleation on server option
                        System.out.println("Server waiting for filename to delete...");
                        try {
                            String filename = socketFromClient.readLine();
                            System.out.println("Filename: " + filename);
                            delete(filename);
                        } catch (Exception e) {
                            System.out.println("Error in deleting file: " + e);
                        }
                        break;
                }
                // option 4 on client --> end session with server
            } while (option != 4);
            System.out.println("Session ended.");
        } catch (Exception e) {
            System.out.println("Server error: " + e);
        }
    }

    // Method to handle file upload
    private void upload(String filename, String data) {
        data = "From client: " + data;

        try (BufferedWriter fileWriter = new BufferedWriter(new FileWriter("src/server/" + filename))) {
            // Write the data to the file
            fileWriter.write(data);

            System.out.println("Data has been written to the new file: " + filename);
        } catch (IOException e) {
            System.out.println("Error in writing file on server: " + e);
        }
    }

    // Method to handle getting the file data
    private String getFileData(String filename) {

        File file = new File("src/server/" + filename);

        if (!file.exists()) {
            System.out.println("File does not exist.");
            return "";
        }
        String line;
        String text = "";

        try (FileReader fileReader = new FileReader(filename);
                BufferedReader bufferedReader = new BufferedReader(fileReader)) {

            while ((line = bufferedReader.readLine()) != null) {
                text += line;
            }
        } catch (IOException e) {
            System.err.println("Error reading the file: " + e);
        }
        return text;
    }

    // Method to handle file deletion
    private void delete(String filename) {
        if (!ifTxt(filename)) {
            return;
        }

        File file = new File("src/server/" + filename);

        if (!file.exists()) {
            System.out.println("File does not exist.");
            return;
        }

        if (file.delete()) {
            System.out.println("File deleted successfully.");
        } else {
            System.out.println("Unable to delete the file.");
        }
    }

    // Server's main method
    private Boolean ifTxt(String filename) {
        if (filename.length() >= 4) {
            String lastFourChars = filename.substring(filename.length() - 4);
            if (lastFourChars.equals(".txt")) {
                return true;
            }
        }
        System.out.println("Invalid filename (must be .txt)");
        return false;
    }

    public static void main(String[] args) throws Exception {
        Server server = new Server(DEFAULT_PORT);
        server.start();
    }
}

/*
 * Summary of the code
 * This code sets up a secure SSL/TLS server in Java. It loads the
 * server's keystore and truststore, initializes key and trust managers, creates
 * an SSL context, configures the SSL server socket, enforces client
 * authentication, and sets the enabled cipher suites for secure communication.
 * This code is a fundamental part of creating a secure server that can handle
 * encrypted connections over TLS/SSL.
 */

/*
SSL/TLS Handshake client to server
Client      Server
|ClientHello   |
|------------->|
|              |
|ServerHello   |
|<-------------|
|              |
|ServerCertificat
|ServerKeyExchange
|CertRequest   |
|ServerHelloEnd|
|<-------------|
|              |
|ClientCertificate
|ClientKeyExchange
|Certvertify   |
|ChangeCipher  |
|Finishd       |
|------------->|
|              |
|ChangeChiper  |
|Finishd       |
|<-------------|
*/ 
