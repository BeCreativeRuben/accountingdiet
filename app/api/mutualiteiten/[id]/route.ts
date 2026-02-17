import { NextResponse } from 'next/server';

// Mutualiteiten zijn vast in de app; geen bewerken of verwijderen.
export async function PUT() {
  return NextResponse.json(
    { error: 'Mutualiteiten zijn vast in het systeem en kunnen niet worden bewerkt.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Mutualiteiten zijn vast in het systeem en kunnen niet worden verwijderd.' },
    { status: 405 }
  );
}
