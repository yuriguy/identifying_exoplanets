// src/pages/Analise.jsx
import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Analise = () => {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setPrediction(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(response.data);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'An error occurred while processing the file.');
      } else {
        setError('Could not connect to the API server. Please check if it is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const countPredictions = (predictions) => {
    return predictions.reduce((acc, item) => {
      acc[item.prediction] = (acc[item.prediction] || 0) + 1;
      return acc;
    }, {});
  };

  const predictionCounts = prediction ? countPredictions(prediction) : {};

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" /> Upload Your File for Analysis
          </CardTitle>
          <CardDescription>
            Select a .csv file containing exoplanet candidate data to get the model's classification.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input type="file" onChange={handleFileChange} accept=".csv" />
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Make Prediction'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="w-full max-w-2xl bg-destructive/10 border-destructive">
            <CardHeader className="flex flex-row items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <CardTitle>Analysis Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
        </Card>
      )}

      {prediction && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-6 w-6" /> Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-base"> {/* Texto aumentado aqui */}
              The file was processed successfully. Below is a summary of the classifications found:
            </p>
            <div className="space-y-2">
                {Object.entries(predictionCounts).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 rounded-md bg-muted text-base"> {/* E aqui */}
                        <span className="font-semibold">{key}</span>
                        <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">{value} occurrences</span>
                    </div>
                ))}
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-2">Analysis Details</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Index</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Orbital Period</TableHead>
                    <TableHead className="text-right">Planetary Radius</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prediction.map((item) => (
                    <TableRow key={item.index}>
                      <TableCell className="font-medium">{item.index}</TableCell>
                      <TableCell>{item.prediction}</TableCell>
                      <TableCell>{item.data.koi_score}</TableCell>
                      <TableCell>{item.data.koi_period.toFixed(4)}</TableCell>
                      <TableCell className="text-right">{item.data.koi_prad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analise;