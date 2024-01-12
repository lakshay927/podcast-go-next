package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

// Podcast struct to represent the structure of each podcast item
type Podcast struct {
	ID              string        `json:"id"`
	Title           string        `json:"title"`
	Description     string        `json:"description"`
	Images          PodcastImages `json:"images"`
	IsExclusive     bool          `json:"isExclusive"`
	PublisherName   string        `json:"publisherName"`
	PublisherID     string        `json:"publisherId"`
	MediaType       string        `json:"mediaType"`
	CategoryID      string        `json:"categoryId"`
	CategoryName    string        `json:"categoryName"`
	HasFreeEpisodes bool          `json:"hasFreeEpisodes"`
	PlaySequence    string        `json:"playSequence"`
}
type PodcastsResponse struct {
	Items []Podcast `json:"items"`
}

// PodcastImages struct to represent the images within the Podcast struct
type PodcastImages struct {
	Default   string `json:"default"`
	Featured  string `json:"featured"`
	Thumbnail string `json:"thumbnail"`
	Wide      string `json:"wide"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func fetchPodcasts(apiURL string) ([]Podcast, error) {
	// Make a GET request to the API
	response, err := http.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("error making the request: %v", err)
	}
	defer response.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	// Check if the response status code is OK (200) or Not Found (404)
	if response.StatusCode == http.StatusNotFound {
		// Return an empty array if the resource is not found
		return []Podcast{}, nil
	}

	// Decode the JSON response into a slice of Podcast structs
	var podcasts []Podcast
	err = json.Unmarshal(body, &podcasts)
	if err != nil {
		return nil, fmt.Errorf("error decoding JSON: %v", err)
	}

	return podcasts, nil
}

func podcastsHandler(w http.ResponseWriter, r *http.Request) {
	searchQuery := r.URL.Query().Get("search")
	page := r.URL.Query().Get("page")

	// URL of the API
	apiURL := "https://601f1754b5a0e9001706a292.mockapi.io/podcasts"

	// Fetch podcasts from the API
	podcasts, err := fetchPodcasts(apiURL + "?p=" + page + "&l=10&search=" + searchQuery)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Error: %v", err))
		return
	}
	response := PodcastsResponse{
		Items: podcasts,
	}

	// Encode the fetched podcasts into JSON and send the response
	w.Header().Set("Access-Control-Allow-Origin", "*")

	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	json.NewEncoder(w).Encode(response)
}

func respondWithError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
}

func main() {
	// Define the API endpoint "/api/podcasts"
	http.HandleFunc("/api/podcasts", podcastsHandler)

	// Start the HTTP server on port 8080
	fmt.Println("Server is running on :8080")
	http.ListenAndServe(":8080", nil)
}
