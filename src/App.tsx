import React, { useState, useEffect, useCallback, MouseEvent } from "react";

function App() {
  const [inputText, setInputText] = useState("");
  const [selectedText, setSelectedText] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [dragStartIndex, setDragStartIndex] = useState<number>(0);
  const [dragEndIndex, setDragEndIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState("");
  const [shouldConvert, setShouldConvert] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleWordClick = (word: string, index: number) => {
    if (!isDragging && !selectedText.includes(word)) {
      setSelectedText([...selectedText, word]);
    }
  };

  const handleMouseDown = (index: number) => {
    setIsDragging(true);
    setDragStartIndex(index);
    setDragEndIndex(index); // Initialize dragEndIndex to the same as dragStartIndex
  };

  const handleMouseOver = (index: number) => {
    if (isDragging) {
      setDragEndIndex(index);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      // Calculate the range of words selected during the drag operation
      const start = Math.min(dragStartIndex, dragEndIndex);
      const end = Math.max(dragStartIndex, dragEndIndex);

      // You must now consider the line breaks when calculating the selected range
      const wordElements = displayText.split(/(\s+)/); // Split by spaces and line breaks
      const selectedWords = wordElements
        .slice(start, end + 1)
        .filter((element, i) => {
          // Filter out the empty strings that were originally just spaces
          return i % 2 === 0 || element.match(/\S/);
        });

      // Join the selected words with spaces to preserve spacing
      const selectedRange = selectedWords.join(" ");

      // Add the single string of selected words to the selectedText array
      setSelectedText((prevSelected) => [
        ...prevSelected,
        selectedRange.trim(),
      ]);
      setIsDragging(false);
    }
  };

  // Function to generate a random pale color
  const getRandomPaleColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 100; // High saturation for more vivid color
    const lightness = 85; // High lightness for a paler color
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Function to apply random color on hover
  const applyHoverColor = (e: MouseEvent<HTMLSpanElement>) => {
    e.currentTarget.style.backgroundColor = getRandomPaleColor();
  };

  // Function to remove color on mouse leave
  const removeHoverColor = (e: MouseEvent<HTMLSpanElement>) => {
    e.currentTarget.style.backgroundColor = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault(); // Stop the default paste action
    const pastedText = e.clipboardData.getData("text");
    setInputText(pastedText); // Set the pasted text into the state
    setShouldConvert(true); // Indicate that a conversion should happen
  };

  const convertTextToWords = useCallback(() => {
    setDisplayText(inputText);
    setInputText(""); // Optionally clear the textarea
    setIsEditing(false); // Switch to view mode
    // The dependencies array below should include all state and props that the effect uses.
  }, [inputText]);

  // Now useEffect will use the memoized version of convertTextToWords
  useEffect(() => {
    if (shouldConvert) {
      convertTextToWords();
      setShouldConvert(false); // Reset the conversion trigger
    }
  }, [shouldConvert, convertTextToWords]); // convertTextToWords is now included as a dependency

  // ... re
  const handleEdit = () => {
    setInputText(displayText); // Populate the textarea with the current display text
    setIsEditing(true); // Switch back to edit mode
  };

  // Split the displayText into words and line breaks and wrap them in spans or br elements
  const words = displayText.split(/(\s+)/).map((segment, index) => {
    // Check if the segment is a line break or multiple breaks
    if (segment.match(/\n+/)) {
      // For each line break, return a <br> element
      return segment
        .split("\n")
        .map((line, i) => (i > 0 ? <br key={`br-${index}-${i}`} /> : ""));
    } else {
      // It's a word or space, so return a span element
      return (
        <span
          key={index}
          onMouseDown={() => handleMouseDown(index)}
          onMouseOver={() => handleMouseOver(index)}
          onMouseUp={handleMouseUp}
          onClick={() => handleWordClick(segment.trim(), index)}
          onMouseEnter={applyHoverColor}
          onMouseLeave={removeHoverColor}
          className={`inline-block px-1 cursor-pointer transition-all duration-300 rounded-md ${
            isDragging &&
            index >= Math.min(dragStartIndex, dragEndIndex) &&
            index <= Math.max(dragStartIndex, dragEndIndex)
              ? "scale-105 bg-blue-100 rounded-md" // Highlight color and scale for active dragging
              : "" // Removed Tailwind hover class
          }`}
        >
          {segment}
        </span>
      );
    }
  });

  return (
    <div className="app mx-auto w-3/4 bg-gray-100 p-4 rounded shadow">
      {isEditing ? (
        <>
          <textarea
            value={inputText}
            onChange={handleTextChange}
            onPaste={handlePaste}
            className="textarea w-full p-2 border border-gray-300 rounded"
            placeholder="Type or paste your text here and then click 'Convert Text'..."
          />
          <button
            onClick={convertTextToWords}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!inputText}
          >
            Convert Text
          </button>
        </>
      ) : (
        <>
          <div className="text-display select-none">{words}</div>
          <button
            onClick={handleEdit}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Edit
          </button>
        </>
      )}
      <div className="sidebar mt-4">
        {selectedText.map((text, index) => (
          <div key={index} className="bg-gray-200 p-1 rounded my-1">
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

//export of App
export default App;
