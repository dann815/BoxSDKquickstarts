// Java SDK
// http://opensource.box.com/box-java-sdk/

// With the two jars in the same folder as the code:
// javac -classpath .:"box-java-sdk-2.1.1.jar:minimal-json-0.9.1.jar" Sample.java
// java -classpath .:"box-java-sdk-2.1.1.jar:minimal-json-0.9.1.jar" Sample

import java.util.logging.*;

// For saving and loading API object state
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Paths;

// For building URLs
import java.net.URL;
import java.net.MalformedURLException;

// JSON Parser
// https://github.com/ralfstx/minimal-json
import com.eclipsesource.json.*;



import com.box.sdk.*;

public final class Sample {

	// Hardcoded here from your Box Developer application
	private static final String CLIENT_ID = "";
	private static final String CLIENT_SECRET = "";

	// Note on Generating First Tokens:  https://cloud.box.com/s/ni74f5y4kida1r6h6pv2f83z0ubz0h2a
	private static final String INITIAL_ACCESS_TOKEN = "";
	private static final String INITIAL_REFRESH_TOKEN = "";

	// Storing the connection to local file.  Must have write permission to local filesystem
	private static boolean saveAPIConnectionToFile(BoxAPIConnection api) {
		try{
		    PrintWriter writer = new PrintWriter("apiState.txt", "UTF-8");
		    writer.println(api.save());
		    writer.close();
		    return true;
		} catch (Exception e) {
		   return false;
		}
	}

	// Looks for local state file and initializes from hardcoded values if none is found.
	private static BoxAPIConnection initializeAPIConnection() {
		try{
		    String state = new String(Files.readAllBytes(Paths.get("apiState.txt")));
		    return BoxAPIConnection.restore(CLIENT_ID, CLIENT_SECRET, state);
		} catch (Exception e) {
		   BoxAPIConnection api = new BoxAPIConnection(CLIENT_ID, CLIENT_SECRET, INITIAL_ACCESS_TOKEN, INITIAL_REFRESH_TOKEN);
		   saveAPIConnectionToFile(api);
		   return api;
		}
	}

	// Saves new tokens back to state file on every API object refresh.
	private static final class APIRefreshListener implements BoxAPIConnectionListener {
		public void onRefresh(BoxAPIConnection api) {
			System.out.println("Refreshed tokens successfully");
			saveAPIConnectionToFile(api);
		}
		public void onError(BoxAPIConnection api, BoxAPIException error) {
			System.out.println("Token exchange error");
		}
	}


	public static void main(String[] args) {
		// Turn on FINE level logging to view the output of the API Requests and Responses
		Logger logger = Logger.getLogger("com.box.sdk");
		logger.setLevel(Level.FINE);
		Handler handler = new ConsoleHandler();
		handler.setLevel(Level.FINE);
		logger.addHandler(handler);

		// Developer Token (60 minute lifespan) from the Box Developer application console
		// BoxAPIConnection api = new BoxAPIConnection("12dALggAFYi5wg0OtmrtIke6wcPbWsyv");

		// Check for state in local file, otherwise initialize from hardcoded tokens
		BoxAPIConnection api = initializeAPIConnection(); 

		// Add the refresh listener
		final APIRefreshListener refreshListener = new APIRefreshListener();
		api.addListener(refreshListener);

		// Use the SDK objects by wrapping the API object
		BoxFolder rootFolder = new BoxFolder(api,'0');
		for (BoxItem.Info itemInfo : rootFolder) {
		    System.out.format("[%s] %s\n", itemInfo.getID(), itemInfo.getName());
		}

		// Make a direct call to the API when the SDK does not cover a specific endpoint+parameter combination
		// Parse the JSON response with the minimal-json library
		// https://github.com/ralfstx/minimal-json
		try {
			URL url = new URL("https://api.box.com/2.0/users/me?fields=id,name,login,role");
			BoxAPIRequest request = new BoxAPIRequest(api, url, "GET");
			//request.setBody(inputStream);
			BoxJSONResponse response = (BoxJSONResponse) request.send();
			String json = response.getJSON();
			JsonObject object = JsonObject.readFrom(json);
			String name = object.get("name").asString();
			String role = object.get("role").asString();
			System.out.println("Logged-in user " + name + " is the role: " + role);
		} catch (MalformedURLException e) {
			System.out.println("Malformed URL.");
		}


	}

}
