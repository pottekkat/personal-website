// Run: go build -o ../

package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

var (
	// available categories of content
	// 1st value is treated as default and 2nd value has special formatting for its file name
	contentTypes = []string{"posts", "daily"}

	defaultTitle = "New Blog Post"

	// if this is being changed, change the logic for creating the file name below
	dateFormat = "2-1-2006"

	// folder where pages is stored
	contentDir = "content"

	// folder where images are stored
	// this program creates a new folder with same file name as the page to store its images
	imageDir = "static/images/"

	// to remove characters other than these from the file name
	nonAlphaNum = regexp.MustCompile(`[^a-zA-Z0-9 ]+`)
)

func main() {
	// use flags to get configuration
	imageFolder := flag.Bool("imageFolder", false, "creates a folder to store images")
	content := flag.String("content", contentTypes[0], fmt.Sprintf("type of content [%v]", strings.Join(contentTypes, ",")))
	title := flag.String("title", defaultTitle, "title of the post")
	cusDate := flag.String("date", "", "date other than current date")

	flag.Parse()

	var filename string

	// generate file name from title of the post
	filename = strings.ReplaceAll(nonAlphaNum.ReplaceAllString(strings.ToLower(*title), ""), " ", "-")

	// prepend formatted date to file name for a type of post
	if *content == contentTypes[1] {
		if len(*cusDate) > 0 {
			filename = *cusDate + "-" + filename
		} else {
			currentTime := time.Now().Format(dateFormat)

			splitDate := strings.Split(currentTime, "-")
			splitDate[2] = splitDate[2][2:]

			currentDate := strings.Join(splitDate, "-")
			fmt.Printf("selected date: %s\n", currentDate)

			filename = currentDate + "-" + filename
		}
	}

	arg := filepath.Join(*content, filename+".md")

	fmt.Printf("creating file: %s\n", filename)

	// create new file through hugo
	if _, err := os.Stat(filepath.Join(contentDir, arg)); errors.Is(err, os.ErrNotExist) {
		cmd := exec.Command("hugo", "new", arg)
		err := cmd.Run()
		if err != nil {
			fmt.Printf("error running \"hugo new\": %s\n", err.Error())
		}
	} else {
		fmt.Printf("error creating a new file: file \"%s\" already exists\n", arg)
	}

	// create image folder if needed (static/images/<name-of-the-file>)
	if *imageFolder {
		if err := os.Mkdir(filepath.Join(imageDir, filename), 0755); err != nil {
			fmt.Printf("error creating folder: %s\n", err.Error())
		}
	}
}
