async function handleAnalyze(file) {
  if (!file) {
    console.error("No file provided for analysis.");
    return;
  }

  console.log("Reading file:", file.name);

  try {
    // Convert file to Base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // strip data URL prefix
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    console.log("File converted to Base64. Sending to API...");

    // Send Base64 to your Next.js API route
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API request failed: ${text}`);
    }

    const data = await response.json();
    console.log(data.result);
    return data.result;

  } catch (error) {
    console.error("❌ Error analyzing image:", error);
    throw error;
  }
}

export default handleAnalyze;
