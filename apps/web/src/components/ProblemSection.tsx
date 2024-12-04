'use client'

import { useState } from 'react'
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { MarkdownEditorWrapper } from 'src/components/MarkdownEditor'

export interface ProblemData {
  description: string
  inputFile: File | null
  outputFile: File | null
  sampleInput: string
  sampleOutput: string
}

interface ProblemSectionProps {
  onChange: (data: ProblemData) => void
}

export function ProblemSection({ onChange }: ProblemSectionProps) {
  const [problem, setProblem] = useState<ProblemData>({
    description: '',
    inputFile: null,
    outputFile: null,
    sampleInput: '',
    sampleOutput: ''
  })

  const updateProblem = (key: keyof ProblemData, value: string | File | null) => {
    const newProblem = { ...problem, [key]: value }
    setProblem(newProblem)
    onChange(newProblem)
  }

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <div>
        <Label htmlFor="problem">Problem Description</Label>
        <MarkdownEditorWrapper 
          onChange={(value) => updateProblem('description', value)} 
        />
      </div>
      <div>
        <Label htmlFor="input-file">Input File</Label>
        <Input 
          id="input-file" 
          type="file" 
          onChange={(e) => updateProblem('inputFile', e.target.files?.[0] || null)} 
        />
      </div>
      <div>
        <Label htmlFor="output-file">Output File</Label>
        <Input 
          id="output-file" 
          type="file" 
          onChange={(e) => updateProblem('outputFile', e.target.files?.[0] || null)} 
        />
      </div>
      <div>
        <Label htmlFor="sample-input">Sample Input</Label>
        <Textarea 
          id="sample-input" 
          value={problem.sampleInput} 
          onChange={(e) => updateProblem('sampleInput', e.target.value)} 
        />
      </div>
      <div>
        <Label htmlFor="sample-output">Sample Output</Label>
        <Textarea 
          id="sample-output" 
          value={problem.sampleOutput} 
          onChange={(e) => updateProblem('sampleOutput', e.target.value)} 
        />
      </div>
    </div>
  )
}

