import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get All To-Dos
export async function GET() {
  try {
    const allToDos = await prisma.task.findMany();

    return NextResponse.json(
      {
        count: allToDos.length,
        allToDos,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}

// POST - Create To-Do
export async function POST(req: NextRequest) {
  // Destructure title and description from the request and parse them into a JSON format
  const { title, description } = await req.json();

  try {
    // Create a new to-do entry, with the completed status set to false, by default
    const createdToDo = { title, description, completed: false };
    await prisma.task.create({
      data: createdToDo,
    });

    return NextResponse.json(
      {
        action: 'create to-do',
        message: 'To-Do successfully created',
        createdToDo,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}

// PATCH - Update To-Do
export async function PATCH(req: NextRequest) {
  // Destructure the id, title, description and completed status from the request and parse them into a JSON format
  const { id, title, description, completed } = await req.json();

  try {
    // Update the to-do that matches the given id
    // Replace its old values with the given new values - title, description, completed status
    const updatedToDo = await prisma.task.update({
      where: { id: id },
      data: { title, description, completed },
    });

    return NextResponse.json(
      {
        action: 'update to-do',
        message: 'To-Do successfully updated',
        updatedToDo,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}

// DELETE - Delete To-Do
export async function DELETE(req: NextRequest) {
  // Destructure the id from the request and parse it into a JSON format
  const { id } = await req.json();

  try {
    // Delete the to-do that matches the given id
    const deletedToDo = await prisma.task.delete({
      where: { id: id },
    });

    return NextResponse.json(
      {
        action: 'delete to-do',
        message: 'To-Do successfully deleted',
        deletedToDo,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}
