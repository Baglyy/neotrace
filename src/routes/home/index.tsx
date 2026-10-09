import { useState } from 'react';
import { 
  Box, 
  Toolbar, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert, 
  Paper 
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { driver } from '../../lib/neo4j'; 

export const Route = createFileRoute('/home/')({
  component: RootComponent,
});

function RootComponent() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  const handleExecute = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    // Ouvrir une session Neo4j
    const session = driver.session();

    try {
      // Exécuter la requête Cypher
      const result = await session.run(query);

      // Convertir les résultats en objets JSON 
      const formattedResults = result.records.map((record) => {
        const obj = record.toObject();
        // Conversion des types Neo4j
        return sanitizeNeo4jData(obj);
      });

      setResults(formattedResults);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la requête Cypher.');
    } finally {
      // Fermer la session
      await session.close();
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{ 
        flexGrow: 1, 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '80vh'
      }}
    >
      <Toolbar />
      <Typography
        component="h1"
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '3.5rem',
          fontWeight: 700,
          mb: 2,
        }}
      >
        NeoTrace
      </Typography>

      <Box sx={{ width: 600, maxWidth: '100%', p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Requête Cypher"
          placeholder="MATCH (n) RETURN n LIMIT 10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Raccourci Ctrl + Entrée
            if (e.key === 'Enter' && e.ctrlKey) {
              handleExecute();
            }
          }}
        />

        <Button
          variant="contained"
          size="large"
          onClick={handleExecute}
          disabled={loading || !query.trim()}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
          sx={{
            bgcolor: '#31b933',
            color: '#071A17',
            '&:hover': {
              bgcolor: '#45d647',
            },
          }}
        >
          {loading ? 'Exécution...' : 'Exécuter (Ctrl + Entrée)'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ width: 600, maxWidth: '100%', mt: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Paper 
          elevation={2} 
          sx={{ 
            width: 600, 
            maxWidth: '100%', 
            mt: 3, 
            p: 2, 
            maxHeight: 350, 
            overflow: 'auto',
            bgcolor: '#1e1e1e',
            color: '#d4d4d4'
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#9cdcfe' }}>
            {results.length} résultat(s) retourné(s) :
          </Typography>
          <pre style={{ margin: 0, fontSize: '0.85rem' }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
}

// Convertit les types en nombres standards pour l'affichage JSON
function sanitizeNeo4jData(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object' && 'low' in value && 'high' in value) {
    return value.toNumber();
  }
  if (value.properties) {
    return sanitizeNeo4jData(value.properties);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeNeo4jData);
  }
  if (typeof value === 'object') {
    const res: any = {};
    for (const key of Object.keys(value)) {
      res[key] = sanitizeNeo4jData(value[key]);
    }
    return res;
  }
  return value;
}