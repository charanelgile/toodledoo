'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashCan,
  faPenToSquare,
} from '@fortawesome/free-regular-svg-icons';

type ToDo = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [allToDos, setAllToDos] = useState<ToDo[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [toBeEdited, setToBeEdited] = useState({
    id: 0,
    title: '',
    description: '',
    completed: false,
  });

  const [pendingToDos, setPendingToDos] = useState<ToDo[]>([]);
  const [completedToDos, setCompletedToDos] = useState<ToDo[]>([]);

  const [error, setError] = useState<string>('');

  const createToDo = async () => {
    if (!title) {
      setError('Please provide a Title for your To-Do');
      return;
    }

    const newToDo = { title, description };

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newToDo),
    });

    const data = await response.json();

    // console.log(data);

    setAllToDos([...allToDos, data]);

    setTitle('');
    setDescription('');
  };

  const editToDo = (todo: ToDo) => {
    setIsEditing(true);

    setToBeEdited({
      id: todo.id,
      title: todo.title,
      description: todo.description!,
      completed: todo.completed,
    });
  };

  const updateToDo = async () => {
    if (!toBeEdited.title) {
      setError('Please provide a Title for your To-Do');
      return;
    }

    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: toBeEdited.id,
        title: toBeEdited.title,
        description: toBeEdited.description,
        completed: toBeEdited.completed,
      }),
    });

    if (response.status === 200) {
      setAllToDos(
        allToDos.map((todo: ToDo) =>
          todo.id === toBeEdited.id
            ? {
                ...todo,
                title: toBeEdited.title,
                description: toBeEdited.description,
                completed: toBeEdited.completed,
              }
            : todo
        )
      );

      setToBeEdited({
        id: 0,
        title: '',
        description: '',
        completed: false,
      });

      setIsEditing(false);
    }
  };

  const cancelUpdate = () => {
    setToBeEdited({
      id: 0,
      title: '',
      description: '',
      completed: false,
    });

    setIsEditing(false);
  };

  const deleteToDo = async (id: number) => {
    const response = await fetch('/api/tasks', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.status === 200) {
      setAllToDos(allToDos.filter((todo: ToDo) => todo.id !== id));
    }
  };

  const toggleToDo = async (markedTodo: ToDo) => {
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: markedTodo.id,
        title: markedTodo.title,
        description: markedTodo.description,
        completed: !markedTodo.completed,
      }),
    });

    if (response.status === 200) {
      setAllToDos(
        allToDos.map((todo: ToDo) =>
          todo.id === markedTodo.id
            ? {
                ...todo,
                completed: !markedTodo.completed,
              }
            : todo
        )
      );
    }
  };

  useEffect(() => {
    const getToDos = async () => {
      await fetch('/api/tasks')
        .then((response) => response.json())
        .then((data) => setAllToDos(data.allToDos))
        .catch((error) => console.log(error));
    };

    // Get All To-Dos
    getToDos();

    // Isolate the Pending To-Dos ...
    setPendingToDos(
      allToDos
        .filter((todo: ToDo) => todo.completed === false)
        .sort((a, b) => b.id - a.id)
    );

    // ... from the Completed To-Dos
    setCompletedToDos(
      allToDos.filter((todo: ToDo) => todo.completed === true)
    );

    setIsLoading(false);
  }, [allToDos]);

  // Clear form data whenever there is an error
  useEffect(() => {
    setTimeout(() => {
      setError('');
      setTitle('');
      setDescription('');
    }, 3500);
  }, [error]);

  return (
    <main className='w-100  bg-slate-100 text-black'>
      <header className='bg-teal-500 h-fit p-3 ps-20'>
        <Link href={'/'}>
          <h1 className='text-white text-4xl font-bold border-2 inline px-4'>
            Toodle<span className='text-gray-700'>Doo.</span>
          </h1>
        </Link>
      </header>

      <div className='flex lg:flex-row flex-col-reverse lg:justify-between justify-center lg:items-start items-center p-12'>
        <div className='lg:w-7/12 md:w-3/4 flex flex-col justify-center items-center md:px-0 lg:px-5 mx-10 md:mt-10 lg:mt-0'>
          <div className='w-full'>
            {isLoading &&
            allToDos.length === 0 &&
            pendingToDos.length === 0 &&
            completedToDos.length === 0 ? (
              <div>
                <h3 className='text-gray-500 text-center text-2xl font-semibold my-2'>
                  Loading your To-Dos...
                </h3>
              </div>
            ) : (
              <div>
                <section>
                  {pendingToDos.map((todo) => {
                    return (
                      <div
                        key={todo.id}
                        className='flex items-center justify-between bg-white shadow-md rounded-md mb-3 p-3'>
                        <div className='flex justify-around mt-3 mb-2'>
                          <input
                            type='checkbox'
                            className='w-6 h-8 ms-2 me-4'
                            checked={todo.completed}
                            onChange={() => toggleToDo(todo)}
                          />

                          <div>
                            <h4 className='text-gray-700 text-lg font-semibold'>
                              {todo.title}
                            </h4>
                            <p className='text-gray-500'>
                              {todo.description}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center m-0'>
                          <button
                            className='bg-teal-500 px-3 py-2 rounded-full mx-2 text-white text-xl font-semibold uppercase'
                            onClick={() => editToDo(todo)}>
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>

                          <button
                            className='bg-red-500 px-3 py-2 rounded-full mx-2 text-white text-xl font-semibold uppercase'
                            onClick={() => deleteToDo(todo.id)}>
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </section>

                <section>
                  {completedToDos.map((todo) => {
                    return (
                      <div
                        key={todo.id}
                        className='flex items-center justify-between bg-white shadow-sm rounded-md mb-1 p-3'>
                        <div className='flex justify-around mt-3 mb-2'>
                          <input
                            type='checkbox'
                            className='w-6 h-8 ms-2 me-4'
                            checked={todo.completed}
                            onChange={() => toggleToDo(todo)}
                            disabled
                          />

                          <div className='select-none'>
                            <h4 className='text-gray-400 text-lg font-semibold line-through'>
                              {todo.title}
                            </h4>
                            <p className='text-gray-300'>
                              {todo.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </section>
              </div>
            )}
          </div>
        </div>

        <div className='bg-white shadow-lg lg:w-5/12 flex flex-col justify-center items-center rounded-md mx-7 p-9'>
          {isEditing ? (
            <div className='text-gray-500'>
              <h3 className='text-gray-700 text-3xl font-semibold mb-3'>
                Edit To-Do
              </h3>

              <label
                htmlFor='title'
                className='text-lg'>
                Title
              </label>

              <input
                id='title'
                name='title'
                type='text'
                required
                className='w-full text-gray-700 text-md border border-gray-400 rounded-sm outline-none py-2 px-3 my-2'
                value={toBeEdited.title}
                onChange={(event) =>
                  setToBeEdited({
                    ...toBeEdited,
                    title: event.target.value,
                  })
                }
              />

              <label
                htmlFor='description'
                className='text-lg'>
                Description
              </label>

              <textarea
                id='description'
                name='description'
                className='w-full text-gray-700 text-md border border-gray-400 rounded-sm outline-none py-2 px-3 my-2'
                value={toBeEdited.description!}
                onChange={(event) =>
                  setToBeEdited({
                    ...toBeEdited,
                    description: event.target.value,
                  })
                }></textarea>

              <div className='text-red-500'>
                <p>{error ? error : null}</p>
              </div>

              <button
                className='bg-teal-500 text-white text-md font-semibold uppercase rounded-sm px-5 py-2 my-3'
                onClick={updateToDo}>
                Save
              </button>

              <button
                className='bg-red-500 text-white text-md font-semibold uppercase rounded-sm px-5 py-2 my-1 mx-3'
                onClick={cancelUpdate}>
                Cancel
              </button>
            </div>
          ) : (
            <div className='text-gray-500'>
              <h3 className='text-gray-700 text-3xl font-semibold mb-3'>
                Add New To-Do
              </h3>

              <label
                htmlFor='title'
                className='text-lg'>
                Title
              </label>

              <input
                id='title'
                name='title'
                type='text'
                required
                placeholder='Enter a title for your to-do'
                className='w-full text-gray-700 text-md border border-gray-400 rounded-sm outline-none py-2 px-3 my-2'
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <label
                htmlFor='description'
                className='text-lg'>
                Description
              </label>

              <textarea
                id='description'
                name='description'
                placeholder='Provide a short description, if needed'
                className='w-full text-gray-700 text-md border border-gray-400 rounded-sm outline-none py-2 px-3 my-2'
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }></textarea>

              <div className='text-red-500'>
                <p>{error ? error : null}</p>
              </div>

              <button
                className='bg-teal-500 text-white text-md font-semibold uppercase rounded-sm px-5 py-2 my-3'
                onClick={createToDo}>
                Add To-Do
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
