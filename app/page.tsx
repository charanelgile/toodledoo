'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashCan,
  faPenToSquare,
} from '@fortawesome/free-regular-svg-icons';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

type ToDo = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
};

const sampleToDos = [
  {
    id: 123,
    title: 'Water the plants',
    description: "Don't forget to water the plants",
    completed: false,
  },
  {
    id: 124,
    title: 'Pick up dry cleaning',
    description: 'Pick up dry cleaning on the way home',
    completed: true,
  },
  {
    id: 125,
    title: 'Buy dog food',
    description: 'Buy Russell his favorite dog food',
    completed: true,
  },
  {
    id: 126,
    title: 'Declutter working table',
    description: '',
    completed: false,
  },
];

export default function Home() {
  // For Conditional Rendering
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDescending, setIsDescending] = useState(true);

  // All, Pending, and Completed To-Dos
  const [allToDos, setAllToDos] = useState<ToDo[]>([]);
  const [pendingToDos, setPendingToDos] = useState<ToDo[]>([]);
  const [completedToDos, setCompletedToDos] = useState<ToDo[]>([]);

  // For Creating New To-Do
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // For Editing Existing To-Do
  const [toBeEdited, setToBeEdited] = useState({
    id: 0,
    title: '',
    description: '',
    completed: false,
  });

  // For Error Messages
  const [error, setError] = useState<string>('');

  // Get All To-Dos - Retrieve the list of to-dos from the database
  const getToDos = async () => {
    await fetch(`/api/tasks`)
      .then((response) => response.json())
      .then((data) => setAllToDos(data.allToDos))
      .catch((error) => console.log(error));
  };

  // Create To-Do - Add new to-do entry
  const createToDo = async () => {
    if (!title) {
      setError('Please provide a Title for your To-Do');
      return;
    }

    const newToDo = { title, description };

    const response = await fetch(`/api/tasks`, {
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

  // Edit To-Do - Change details of existing to-do entry
  const editToDo = (todo: ToDo) => {
    setIsEditing(true);

    setTitle('');
    setDescription('');

    setToBeEdited({
      id: todo.id,
      title: todo.title,
      description: todo.description!,
      completed: todo.completed,
    });
  };

  // Update To-Do - Send the changes to the backend and the database
  const updateToDo = async () => {
    if (!toBeEdited.title) {
      setError('Please provide a Title for your To-Do');
      return;
    }

    const response = await fetch(`/api/tasks`, {
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

  // Cancel Update - Cancel the process of editing a to-do entry
  const cancelUpdate = () => {
    setToBeEdited({
      id: 0,
      title: '',
      description: '',
      completed: false,
    });

    setIsEditing(false);
  };

  // Delete To-Do - Remove a to-do entry from the database
  const deleteToDo = async (id: number) => {
    const response = await fetch(`/api/tasks`, {
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

  // Toggle To-Do - Mark to-do entry as "Completed" or "Pending"
  const toggleToDo = async (markedTodo: ToDo) => {
    const response = await fetch(`/api/tasks`, {
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

  // Clear Complete - Remove all completed to-do entries from the database
  const clearCompleted = () => {
    completedToDos.forEach((completedToDo) => {
      deleteToDo(completedToDo.id);
    });
  };

  // Trigger Sorting of Pending To-Dos
  const sortPendings = () => {
    if (isDescending) {
      setIsDescending(false);
    } else {
      setIsDescending(true);
    }
  };

  // Get the List of To-Dos on initial page load
  useEffect(() => {
    getToDos();
  }, []);

  // Get the List of To-Dos whenever there are changes in any of its items
  useEffect(() => {
    getToDos();

    // Isolate the Pending To-Dos
    if (isDescending) {
      // Sort them in Descending Order
      setPendingToDos(
        allToDos
          .filter((todo: ToDo) => todo.completed === false)
          .sort((a, b) => b.id - a.id)
      );
    } else {
      // Sort them in Ascending Order
      setPendingToDos(
        allToDos
          .filter((todo: ToDo) => todo.completed === false)
          .sort((a, b) => a.id - b.id)
      );
    }

    // Isolate the Completed To-Dos
    setCompletedToDos(
      allToDos.filter((todo: ToDo) => todo.completed === true)
    );

    setIsLoading(false);
  }, [allToDos, isDescending]);

  // Clear the form data whenever there is an error
  useEffect(() => {
    setTimeout(() => {
      setError('');
      setTitle('');
      setDescription('');
    }, 3500);
  }, [error]);

  return (
    <main
      className={`${
        allToDos.length > 5 ? 'lg:h-100' : 'lg:h-screen'
      } w-100 md:h-fit text-black`}>
      {/* Header */}
      <header className='w-full flex justify-center lg:justify-start bg-teal-500 h-fit p-3 lg:ps-20 sm:ps-0'>
        <Link href={'/'}>
          <h1 className='text-white text-4xl font-bold border-2 inline px-4'>
            Toodle<span className='text-gray-700'>Doo.</span>
          </h1>
        </Link>
      </header>

      <div className='flex lg:flex-row flex-col-reverse lg:justify-between justify-center lg:items-start items-center p-3 sm:p-7 md:p-12'>
        <div className='w-full md:w-3/4 lg:w-7/12 flex flex-col justify-center items-center md:px-0 lg:px-5 mx-10 mt-10 lg:mt-0'>
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
                {allToDos.length === 0 ? (
                  <div>
                    <h3 className='text-gray-500 text-center text-2xl font-semibold my-2'>
                      No To-Dos to display
                    </h3>
                  </div>
                ) : (
                  // Sort and Clear Complete Buttons
                  <div>
                    <div className='w-full flex justify-between'>
                      <h5
                        className='text-gray-600 text-lg font-medium cursor-pointer inline-block mb-3 px-5'
                        onClick={sortPendings}>
                        Sort&nbsp;&nbsp;
                        {isDescending ? (
                          <FontAwesomeIcon icon={faArrowDown} />
                        ) : (
                          <FontAwesomeIcon icon={faArrowUp} />
                        )}
                      </h5>

                      {completedToDos.length > 0 ? (
                        <h5
                          className={`${
                            isEditing
                              ? 'pointer-events-none text-gray-400 '
                              : 'text-red-500 '
                          } text-lg font-medium cursor-pointer inline-block mb-3 px-5`}
                          onClick={clearCompleted}>
                          Clear Completed
                        </h5>
                      ) : null}
                    </div>

                    {/* Pending To-Dos */}
                    <section>
                      {pendingToDos.map((todo) => {
                        return (
                          <div
                            key={todo.id}
                            className='flex items-center justify-between bg-white shadow-md rounded-md mb-3 p-3'>
                            <div className='flex justify-around mt-3 mb-2'>
                              {isEditing ? (
                                <input
                                  type='checkbox'
                                  className='w-6 h-8 ms-2 me-4'
                                  disabled
                                />
                              ) : (
                                <input
                                  type='checkbox'
                                  className='w-6  h-8 ms-2 me-4'
                                  checked={todo.completed}
                                  onChange={() => toggleToDo(todo)}
                                />
                              )}

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
                                className={`${
                                  isEditing
                                    ? 'pointer-events-none bg-gray-300 '
                                    : 'bg-teal-500 '
                                } px-3 py-2 rounded-full mx-2 text-white text-xl font-semibold uppercase`}
                                onClick={() => editToDo(todo)}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </button>

                              <button
                                className={`${
                                  isEditing
                                    ? 'pointer-events-none bg-gray-300 '
                                    : 'bg-red-500 '
                                } px-3 py-2 rounded-full mx-2 text-white text-xl font-semibold uppercase`}
                                onClick={() => deleteToDo(todo.id)}>
                                <FontAwesomeIcon icon={faTrashCan} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </section>

                    {completedToDos.length > 0 ? (
                      <h5
                        className={`${
                          isEditing
                            ? 'pointer-events-none text-gray-400 '
                            : 'text-red-500 '
                        } text-lg font-medium cursor-pointer inline-block mt-5 mb-3 px-5`}
                        onClick={clearCompleted}>
                        Clear Completed
                      </h5>
                    ) : null}

                    {/* Completed To-Dos */}
                    <section>
                      {completedToDos.map((todo) => {
                        return (
                          <div
                            key={todo.id}
                            className='flex items-center justify-between bg-white shadow-sm rounded-md mb-1 p-3'>
                            <div className='flex justify-around mt-3 mb-2'>
                              {isEditing ? (
                                <input
                                  type='checkbox'
                                  className='w-6 h-8 ms-2 me-4'
                                  disabled
                                />
                              ) : (
                                <input
                                  type='checkbox'
                                  className='w-6  h-8 ms-2 me-4'
                                  checked={todo.completed}
                                  onChange={() => toggleToDo(todo)}
                                />
                              )}

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
            )}
          </div>
        </div>

        {/* Form for Editing To-Do */}
        <div
          id='frmToDo'
          className='bg-white shadow-lg lg:w-5/12 flex flex-col justify-center items-center rounded-md mx-1 md:mx-7 p-9'>
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
                className='w-full text-gray-700 text-md border border-gray-400 rounded-sm outline-none focus:ring-2 ring-teal-500 ring-inset py-2 px-3 my-2'
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
                className='w-full text-gray-700 text-md border border-gray-400 rounded-sm outline-none focus:ring-2 ring-teal-500 ring-inset resize-none py-2 px-3 my-2'
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
            // Form for Creating To-Do
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
                className='w-full text-gray-700 text-md border border-gray-400 rounded-sm outline-none focus:ring-2 ring-teal-500 ring-inset py-2 px-3 my-2'
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
                className='w-full text-gray-700 text-md border border-gray-400 rounded-sm outline-none focus:ring-2 ring-teal-500 ring-inset resize-none py-2 px-3 my-2'
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

      {/* Floating Arrow Up - Go to Top Button */}
      <Link
        href={'#frmTodo'}
        className='flex justify-center lg:hidden'>
        <button className='bg-teal-500 text-white text-3xl rounded-full fixed bottom-0 px-5 py-3 my-8 mx-0'>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      </Link>
    </main>
  );
}
