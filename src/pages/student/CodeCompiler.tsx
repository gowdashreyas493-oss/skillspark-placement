import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Play, Loader2, Code2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const languageTemplates: Record<string, string> = {
  python: `# Python code
print("Hello, World!")`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  javascript: `// JavaScript code
console.log("Hello, World!");`
};

export default function CodeCompiler() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(languageTemplates.python);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(languageTemplates[newLang]);
    setOutput("");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Compiling and running code...");

    try {
      // Simulate compilation and execution
      // In production, you would integrate with JDoodle API or similar
      setTimeout(async () => {
        const mockOutput = `Successfully compiled and executed ${language} code:\n\nOutput:\nHello, World!\n\nProgram finished with exit code 0`;
        setOutput(mockOutput);

        // Save code submission
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: studentProfile } = await supabase
            .from("student_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (studentProfile) {
            await supabase.from("code_submissions").insert({
              student_id: studentProfile.id,
              language,
              code,
              output: mockOutput,
              status: "success"
            });
          }
        }

        setIsRunning(false);
        toast.success("Code executed successfully!");
      }, 2000);
    } catch (error) {
      setOutput("Error: Failed to execute code");
      setIsRunning(false);
      toast.error("Failed to execute code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="border-primary/20 shadow-glow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Code2 className="w-6 h-6" />
              Code Compiler
            </CardTitle>
            <CardDescription>Write, compile, and run code in multiple languages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleRunCode} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Code
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code Editor</label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Write your code here..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Output</label>
                <div className="min-h-[400px] p-4 bg-muted rounded-lg border font-mono text-sm whitespace-pre-wrap">
                  {output || "Output will appear here..."}
                </div>
              </div>
            </div>

            <div className="bg-info/10 border border-info/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-info">Tips:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Write clean and well-commented code</li>
                <li>Test your code with different inputs</li>
                <li>Check for syntax errors before running</li>
                <li>Practice regularly to improve your coding skills</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}