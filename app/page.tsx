'use client';

import { useState, useEffect } from 'react';

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

  const [error, setError] = useState<string>('');

  const createToDo = async () => {
    if (!title) {
      setError('Please provide a Title for your To-Do');
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

    getToDos();
    setIsLoading(false);
  }, [allToDos]);

  return (
    <div className='grid lg:place-items-start place-items-center w-full bg-white text-gray-500 min-h-screen'>
      <div className='flex lg:flex-row flex-col-reverse gap-3 lg:justify-start justify-center lg:items-start items-center w-full'>
        <div className='sm:w-12/12 lg:w-5/12 w-full px-4 lg:my-10 flex flex-col justify-center items-center'>
          <div className='w-full'>
            {isLoading ? (
              <div>
                <h3 className='text-center text-2xl font-semibold my-2'>
                  Loading your to-dos...
                </h3>
              </div>
            ) : (
              allToDos.map((todo) => {
                return (
                  <div
                    key={todo.id}
                    className='flex items-center justify-between'>
                    <div className='flex justify-around mt-3 mb-2'>
                      <input
                        type='checkbox'
                        className='w-4 h-5 mx-2 mt-1'
                        checked={todo.completed}
                        onChange={() => toggleToDo(todo)}
                      />

                      <div>
                        <h4 className='text-lg font-semibold'>
                          {todo.title}
                        </h4>
                        <p>{todo.description}</p>
                      </div>
                    </div>

                    <div className='flex items-center m-0'>
                      <button
                        className='bg-green-500 px-3 py-2 rounded-md mx-1 text-white text-md font-semibold uppercase'
                        onClick={() => editToDo(todo)}>
                        Update
                      </button>

                      <button
                        className='bg-red-500 px-3 py-2 rounded-md mx-1 text-white text-md font-semibold uppercase'
                        onClick={() => deleteToDo(todo.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className='sm:w-12/12 lg:w-7/12 w-full px-4 lg:my-10 flex flex-col justify-center items-center'>
          <h1 className='lg:text-5xl text-3xl py-5 lg:pt-8 font-bold text-blue-500'>
            To-Do List App
          </h1>

          {isEditing ? (
            <div>
              <h3 className='text-center text-lg font-semibold'>
                Edit To-Do
              </h3>

              <label htmlFor=''>Title</label>
              <input
                type='text'
                className='w-full lg:8/12 border border-gray-500 p-2 text-md rounded-md text-gray-500 outline-none my-2'
                value={toBeEdited.title}
                onChange={(event) =>
                  setToBeEdited({
                    ...toBeEdited,
                    title: event.target.value,
                  })
                }
              />

              <label htmlFor=''>Description</label>
              <textarea
                name=''
                id=''
                className='w-full lg:8/12 border border-gray-500 p-2 text-sm rounded-md text-gray-500 outline-none my-2'
                value={toBeEdited.description!}
                onChange={(event) =>
                  setToBeEdited({
                    ...toBeEdited,
                    description: event.target.value,
                  })
                }></textarea>

              <button
                className='bg-green-500 px-3 py-2 rounded-md my-1 me-1 text-white text-md font-semibold uppercase'
                onClick={updateToDo}>
                Save
              </button>

              <button
                className='bg-red-500 px-3 py-2 rounded-md m-1 text-white text-md font-semibold uppercase'
                onClick={cancelUpdate}>
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <h3 className='text-center text-lg font-semibold'>
                Add New To-Do
              </h3>

              <label htmlFor=''>Title</label>
              <input
                type='text'
                className='w-full lg:8/12 border border-gray-500 p-2 text-md rounded-md text-gray-500 outline-none my-2'
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <label htmlFor=''>Description</label>
              <textarea
                name=''
                id=''
                className='w-full lg:8/12 border border-gray-500 p-2 text-sm rounded-md text-gray-500 outline-none my-2'
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }></textarea>

              <button
                className='bg-blue-500 px-3 py-2 rounded-md my-1 text-white text-md font-semibold uppercase'
                onClick={createToDo}>
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore the Next.js 13 playground.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  )
}
 */
