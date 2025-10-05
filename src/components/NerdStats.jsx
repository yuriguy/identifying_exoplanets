import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCw } from "lucide-react"

function pct(n) {
  if (n == null || Number.isNaN(n)) return "—"
  return (Number(n) * 100).toFixed(1) + "%"
}

function Bar({ value }) {
  const width = Math.max(0, Math.min(100, Number(value) * 100))
  return (
    <div className="h-2 w-full rounded bg-muted/60">
      <div className="h-2 rounded bg-primary transition-[width]" style={{ width: `${width}%` }} />
    </div>
  )
}

const API_URL = "http://127.0.0.1:5000";

export default function NerdStats({ className = "" }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchStats() {
    try {
      setLoading(true)
      setError("")
      const res = await axios.get(`${API_URL}/stats`, {
        headers: { Accept: "application/json" },
      })
      setData(res.data)
    } catch (e) {
      setError("Falha ao buscar /stats. API tá rodando em 127.0.0.1:5000?")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const cr = data?.classification_report
  const rows = [
    ["CANDIDATE", cr?.["CANDIDATE"]],
    ["CONFIRMED", cr?.["CONFIRMED"]],
    ["FALSE POSITIVE", cr?.["FALSE POSITIVE"]],
  ]
  const macro = cr?.["macro avg"]
  const weighted = cr?.["weighted avg"]

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-xl">Estatísticas para Nerds</CardTitle>
        <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Atualizar
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {/* Accuracy geral */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="p-3 rounded-lg border bg-card/70">
            <div className="text-xs text-muted-foreground">Accuracy</div>
            <div className="text-2xl font-bold">{pct(data?.accuracy)}</div>
            <div className="mt-2"><Bar value={data?.accuracy} /></div>
          </div>

          <div className="p-3 rounded-lg border bg-card/70">
            <div className="text-xs text-muted-foreground">Macro avg (F1)</div>
            <div className="text-2xl font-bold">{pct(macro?.["f1-score"])}</div>
            <div className="mt-2"><Bar value={macro?.["f1-score"]} /></div>
          </div>

          <div className="p-3 rounded-lg border bg-card/70">
            <div className="text-xs text-muted-foreground">Weighted avg (F1)</div>
            <div className="text-2xl font-bold">{pct(weighted?.["f1-score"])}</div>
            <div className="mt-2"><Bar value={weighted?.["f1-score"]} /></div>
          </div>
        </div>

        {/* Por classe */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Classe</TableHead>
                <TableHead className="w-[120px]">Precision</TableHead>
                <TableHead className="w-[120px]">Recall</TableHead>
                <TableHead className="w-[120px]">F1</TableHead>
                <TableHead className="w-[120px]">Support</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([name, m]) => (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{pct(m?.precision)}</div>
                    <Bar value={m?.precision} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{pct(m?.recall)}</div>
                    <Bar value={m?.recall} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{pct(m?.["f1-score"])}</div>
                    <Bar value={m?.["f1-score"]} />
                  </TableCell>
                  <TableCell>{m?.support ?? "—"}</TableCell>
                </TableRow>
              ))}

              {/* médias */}
              <TableRow>
                <TableCell className="font-medium">Macro avg</TableCell>
                <TableCell>
                  <div className="text-sm">{pct(macro?.precision)}</div>
                  <Bar value={macro?.precision} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{pct(macro?.recall)}</div>
                  <Bar value={macro?.recall} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{pct(macro?.["f1-score"])}</div>
                  <Bar value={macro?.["f1-score"]} />
                </TableCell>
                <TableCell>{macro?.support ?? "—"}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Weighted avg</TableCell>
                <TableCell>
                  <div className="text-sm">{pct(weighted?.precision)}</div>
                  <Bar value={weighted?.precision} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{pct(weighted?.recall)}</div>
                  <Bar value={weighted?.recall} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{pct(weighted?.["f1-score"])}</div>
                  <Bar value={weighted?.["f1-score"]} />
                </TableCell>
                <TableCell>{weighted?.support ?? "—"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
