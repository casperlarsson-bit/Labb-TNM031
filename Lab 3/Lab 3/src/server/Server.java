package server;

//import java.io.*;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.security.KeyStore;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLServerSocket;
import javax.net.ssl.SSLServerSocketFactory;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.TrustManagerFactory;

public class Server {
    //private ServerSocket serverSocket;
    private int port;
    static final int DEFAULT_PORT = 8189;
    static final String KEYSTORE = "src/server/LIUkeystore.ks";
    static final String TRUSTSTORE = "src/server/LIUtruststore.ks";
    static final String STOREPASSWD = "123456";
    static final String ALIASPASSWD = "123456";

    Server(int port) {
        this.port = port;
    }

    public void start() {
        try {
            //this.serverSocket = new ServerSocket(this.port);
            KeyStore ks = KeyStore.getInstance("JCEKS");
            ks.load(new FileInputStream(KEYSTORE), STOREPASSWD.toCharArray());
            
            KeyStore ts = KeyStore.getInstance("JCEKS");
            ts.load(new FileInputStream(TRUSTSTORE), STOREPASSWD.toCharArray());
            
            KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
            kmf.init(ks, ALIASPASSWD.toCharArray());
            
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(("SunX509"));
            tmf.init(ts);
            
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);
            
            SSLServerSocketFactory sslServerFactory = sslContext.getServerSocketFactory();
            
            SSLServerSocket sss = (SSLServerSocket) sslServerFactory.createServerSocket(port);
            sss.setEnabledCipherSuites(sss.getSupportedCipherSuites());
            
            SSLSocket incoming = (SSLSocket)sss.accept();
            
            BufferedReader in = new BufferedReader(new InputStreamReader(incoming.getInputStream()));
            PrintWriter out = new PrintWriter( incoming.getOutputStream(), true );

            System.out.println("Server is runing...\nEnter option: ");
            String input = in.readLine();


            switch(input){}
        } 
        catch (Exception e) {
            System.out.println("Cannot start server : " + e);
        }
    }

    public String download() {

        return "";
    }

    public void upload(String filename, String data) {

    }

    public void delete(String filename) {

    }

    // Server main
    public static void main(String[] args) throws Exception {
        Server server = new Server(DEFAULT_PORT);
        server.start();
    }
}
