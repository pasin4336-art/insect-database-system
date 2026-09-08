import React from 'react';
import { 
  Card, CardContent, CardMedia, Button, Typography, Container, Box, Chip, Divider 
} from '@mui/material';
import Link from 'next/link';

export async function getAttraction(id) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${apiUrl}/api/attractions/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch attraction detail:", err);
    return null;
  }
}

export default async function AttractionDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const attraction = await getAttraction(id);

  if (!attraction) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
          Attraction not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We could not find the attraction details with ID #{id}.
        </Typography>
        <Link href="/attractions" passHref style={{ textDecoration: 'none' }}>
          <Button variant="contained">
            Back to Attractions
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/attractions" passHref style={{ textDecoration: 'none' }}>
          <Button variant="outlined" size="small">
            ← Back to Attractions
          </Button>
        </Link>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 4 }}>
        {attraction.coverimage && (
          <CardMedia
            component="img"
            height="380"
            image={attraction.coverimage}
            alt={attraction.name}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {attraction.name}
            </Typography>
            {attraction.id && (
              <Chip label={`ID: ${attraction.id}`} color="primary" variant="outlined" size="small" />
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
            {attraction.detail}
          </Typography>

          {(attraction.latitude || attraction.longitude) && (
            <Box sx={{ mt: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Coordinates:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latitude: {attraction.latitude || 'N/A'}, Longitude: {attraction.longitude || 'N/A'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
