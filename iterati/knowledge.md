# Iterati Knowledge

## Entity Processing

- System identifies and extracts the primary category of named entities
- Focuses on the most prominent category in each transcription
- Maintains proper capitalization of extracted entities
- Avoids mixing different entity types in single processing batch
- Uses schema validation to ensure consistent data structure
- Captures contextual data (e.g., city) during initial extraction

## Data Management

- Uses lowdb for local JSON storage
- Prevents duplicate entries based on exact name matches
- Maintains normalized data format across all entity types
- Progressive enrichment pattern: basic extraction → contextual data → detailed attributes
- Maintains ability to revert to original data if enrichment is incorrect
- Preserves core fields when reverting enriched data

## Enrichment Pipeline

- Three-stage process: encode → enrich → review
- Each stage operates independently on the shared database
- Enrichment adds details like addresses and coordinates
- Handles API rate limits with delays between requests
- Validates enriched data against defined schemas
- Preserves existing data when enriching
- Uses full context from previous stages for better enrichment
- Human review required before enriched data is finalized
- Review stage can revert individual entries to original state

## API Patterns

- Centralizes API calls through helper functions
- Implements consistent error handling across stages
- Uses controlled delays to respect rate limits
- Validates API responses before storage
