package client;

import java.io.*;
import java.net.*;
import javax.net.ssl.*;
import java.security.*;

public class Client {
    private InetAddress host;
    private int port;
    // This is not a reserved port number
    static final int DEFAULT_PORT = 8189;
    static final String KEYSTORE = "src/client/LIUkeystore.ks";
    static final String TRUSTSTORE = "src/client/LIUtruststore.ks";
    static final String STOREPASSWD = "123456";
    static final String ALIASPASSWD = "123456";

    // Constructor to initialize the host and port for the client
    Client(InetAddress host, int port) {
        this.host = host;
        this.port = port;
    }

    // Main method to run the client application
    public void run() {
        try {
            // Load the client's keystore and truststore
            KeyStore ks = KeyStore.getInstance("JCEKS");
            ks.load(new FileInputStream(KEYSTORE), STOREPASSWD.toCharArray());

            KeyStore ts = KeyStore.getInstance("JCEKS");
            ts.load(new FileInputStream(TRUSTSTORE), STOREPASSWD.toCharArray());

            // Initialize KeyManagerFactory with the client keystore
            KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
            kmf.init(ks, ALIASPASSWD.toCharArray());

            // Initialize TrustManagerFactory with the truststore
            TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
            tmf.init(ts);

            // Create and configure an SSL context for secure communication
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);
            SSLSocketFactory sslFact = sslContext.getSocketFactory();
            SSLSocket client = (SSLSocket) sslFact.createSocket(host, port);
            client.setEnabledCipherSuites(client.getSupportedCipherSuites());
            // =========================================
            client.setNeedClientAuth(true);            
            // =========================================
            
            System.out.println("\n>>>> SSL/TLS handshake completed");

            // Create input and output streams for communication with the server
            BufferedReader socketFromServer = new BufferedReader(new InputStreamReader(client.getInputStream()));
            PrintWriter socketToServer = new PrintWriter(client.getOutputStream(), true);

            Boolean terminate = false;

            do {
                // Display the client menu to the user
                printMenu();

                // Read the user's menu choice
                String input = new BufferedReader(new InputStreamReader(System.in)).readLine();
                int option = Integer.parseInt(input);

                // Send the user's choice to the server
                socketToServer.println(option);
                switch (option) {
                    case 1:
                        upload(socketToServer);
                        break;
                    case 2:
                        // Download file option
                        download(socketToServer, socketFromServer);
                        break;
                    case 3:
                        // Delete file option
                        delete(socketToServer);
                        break;
                    case 4:
                        terminate = true;
                        break;
                    default:
                        System.out.println("Invalid option!");
                        break;
                }
            } while (!terminate);

            System.out.println("Terminating connection...");

        } catch (Exception e) {
            System.out.println("Client error: " + e);
        }
    }

    // Method to display the client menu
    public void printMenu() {
        System.out.println("\nPlease choose an option: ");
        System.out.println("1. Upload file to server. ");
        System.out.println("2. Download file from server. ");
        System.out.println("3. Delete file on server. ");
        System.out.println("4. Terminate connection. ");
    }

    // Method to upload a file to the server
    public void upload(PrintWriter socketToServer) {
        // Upload file option
        System.out.print("Enter filename: ");
        try {
            String filename = new BufferedReader(new InputStreamReader(System.in)).readLine();
            String line;
            String text = "";

            try (FileReader fileReader = new FileReader(filename);
                    BufferedReader bufferedReader = new BufferedReader(fileReader)) {

                while ((line = bufferedReader.readLine()) != null) {
                    text += line;
                }

                System.out.println("Uploading " + filename + " to the server");

                // Send the filename to the server
                socketToServer.println(filename);
                // Send the user's data (in file) to the server
                socketToServer.println(text);

            } catch (IOException e) {
                System.err.println("Error reading the file: " + e);
            }
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    // Method to download a file from the server
    public void download(PrintWriter socketToServer, BufferedReader socketFromServer) {
        try {
            System.out.print("Enter filename: ");
            String filename = new BufferedReader(new InputStreamReader(System.in)).readLine();
            socketToServer.println(filename);
            String data = socketFromServer.readLine();
            creatFile(filename, data);
        } catch (Exception e) {
            System.err.println("Error reading the filename: " + e);
        }
    }

    // Method to delete a file on the server
    public void delete(PrintWriter socketToServer) {
        try {
            System.out.print("Enter filename: ");
            String filename = new BufferedReader(new InputStreamReader(System.in)).readLine();
            socketToServer.println(filename);

        } catch (Exception e) {
            System.err.println("Error reading the filename: " + e);
        }
    }

    // Method to handle creating a file
    private void creatFile(String filename, String data) {
        data = "From server: " + data;
        
        try (BufferedWriter fileWriter = new BufferedWriter(new FileWriter("src/client/" + filename))) {
            // Write the data to the file
            fileWriter.write(data);
            System.out.println("Data has been written to the new file: " + filename);
        } catch (IOException e) {
            System.out.println("Error in writing file on client: " + e);
        }
    }

    // Client's main method
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
