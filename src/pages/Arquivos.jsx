import { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Fixed headers for the NASA model
const CSV_HEADERS = [
  'Not Transit-Like Flag',
  'Stellar Eclipse Flag',
  'Centroid Offset Flag',
  'Ephemeris Match Indicates Contamination Flag',
  'Orbital Period (days)',
  'Transit Duration (hours)',
  'Transit Depth (parts per million)',
  'Planetary Radius (Earth radii)',
  'Equilibrium Temperature (Kelvin)',
  'Insolation Flux [Earth flux]',
  'Transit Signal-to-Noise',
  'Disposition Score'
];

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Arquivos() {
  const downloadCSV = () => {
    const headerLine = CSV_HEADERS.join(',') + '\n';
    downloadBlob(headerLine, 'exoplanets_template.csv', 'text/csv;charset=utf-8;');
  };

  const downloadExcel = async () => {
    /* try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.aoa_to_sheet([HEADERS]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      downloadBlob(
        wbout,
        'exoplanetas_modelo.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    } catch (e) {
      alert('Para baixar Excel, instale a lib "xlsx": npm i xlsx');
    } */
    alert('The Excel download functionality has not been implemented yet.');
  };

  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPrediction(null);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a CSV file to process.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await axios.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // A API pode retornar um objeto com uma chave 'results' ou o array diretamente.
      // Esta verificação garante que lidamos com ambos os casos.
      const predictionData = response.data.results || response.data;
      if (Array.isArray(predictionData)) {
        setPrediction(predictionData);
      } else {
        setError("The API response did not contain a valid results array.");
      }
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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Exoplanets</CardTitle>
          <CardDescription>
            The required columns are:
          </CardDescription>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_disposition</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_fpflag_nt</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_fpflag_ss</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_fpflag_co</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_fpflag_ec</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_period</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_duration</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_depth</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_prad</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_teq</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_insol</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_model_snr</span>
            <span className="px-2 py-1 rounded bg-muted text-foreground font-mono">koi_score</span>
          </div>
        </CardHeader>


        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button variant="outline" onClick={downloadCSV}>
              Download CSV
            </Button>
            <div className="relative group">
              <a
                href="/assets/exoplanetas_exemplo.csv" 
                download="exoplanetas_exemplo.csv"
                className="w-8 h-8 flex items-center justify-center rounded-full border text-base font-bold hover:bg-muted transition-colors"
              >
                ?
              </a>
              <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                If you have doubts about the template, click here
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Upload filled spreadsheet (.csv)
            </label>
            <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} />
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Process'}
          </Button>
        </CardFooter>
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
            <p className="mb-4 text-base">
              The file was processed successfully. Below is a summary of the classifications found:
            </p>
            <div className="space-y-2">
                {Object.entries(predictionCounts).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 rounded-md bg-muted text-base">
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
}

export default Arquivos;
