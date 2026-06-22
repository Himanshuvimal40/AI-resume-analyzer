import { type FormEvent, useState } from "react";
import NavBar from ".././components/NavBar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  /* --------------------------- VALID PUTER MODELS --------------------------- */
  const MODEL_OPTIONS = [
    "claude-sonnet-4",
    "claude",
     
  ];

  const [model, setModel] = useState("claude-sonnet-4");

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  /* --------------------------- ANALYZE RESUME --------------------------- */
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);

    /* ---------- Upload resume ---------- */
    setStatusText("Uploading the resume...");
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Error: Failed to upload file");

    /* ---------- Convert PDF to Image ---------- */
    setStatusText("Generating resume preview...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file)
      return setStatusText("Error: Failed to convert PDF to image");

    /* ---------- Upload preview image ---------- */
    setStatusText("Uploading preview image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Error: Failed to upload image");

    /* ---------- Save raw data to KV (without feedback yet) ---------- */
    setStatusText("Saving data...");
    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      model, // save model selected by user
      feedback: "",
    };

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    /* ---------- AI ANALYSIS ---------- */
    setStatusText(`Analyzing with ${model}...`);

    const feedback = await ai.feedback(
      uploadedFile.path, // original uploaded resume file path
      prepareInstructions({ jobTitle, jobDescription }),
      model
    );

    if (!feedback) return setStatusText("Error: AI failed to analyze resume");

    /* ---------- Extract AI content ---------- */
    let feedbackText = "";
    if (typeof feedback.message?.content === "string") {
      feedbackText = feedback.message.content;
    } else {
      feedbackText = feedback.message?.content?.[0]?.text || "";
    }

    /* ---------- Save parsed feedback ---------- */
    try {
      data.feedback = JSON.parse(feedbackText);
    } catch (err) {
      console.error("JSON Parse Error:", feedbackText);
      data.feedback = "";
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Done! Redirecting...");
    navigate(`/resume/${uuid}`);
  };

  /* --------------------------- FORM SUBMIT --------------------------- */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <NavBar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>

          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                />
              </div>

              <div className="form-div">
                <label>Job Title</label>
                <input type="text" name="job-title" placeholder="Job Title" />
              </div>

              <div className="form-div">
                <label>Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                />
              </div>

              {/* ---------------- MODEL DROPDOWN ---------------- */}
              <div className="form-div">
                <label>Select AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input-box"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-div">
                <label>Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
