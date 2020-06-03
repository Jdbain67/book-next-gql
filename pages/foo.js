import Head from 'next/head'
import { useState, useEffect } from 'react'
import { createBooks } from '../utils/api'
import { Container, Flex, Box, Input, Label, Alert, Close, Spinner } from 'theme-ui'
import Button from '../components/Button'
import { FaPlus, FaMinus } from 'react-icons/fa'

export default function Add(props) {
  const [title, setTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [authors, setAuthors] = useState([{ name: '' }])
  const [alert, setAlert] = useState({show: false, message: 'message'})
  const [loading, setLoading] = useState(false)
  const [bookTitles, setBookTitles] = useState({})
  const GBAPI = 'https://www.googleapis.com/books/v1/volumes?printType=books&maxResults=5&printType=books&'

  // useEffect(() => {
  //   async function fetchBooks() {
  //     const res = await fetch(GBAPI + new URLSearchParams({q:title}))
  //     const data = await res.json()
  //     //console.log(data)
  //     setBookTitles(data)
  //   }
  //   if (title.length > 3) {
  //     fetchBooks()  
  //   }
  // }, [title])
  
  const handleLookAhead = () => {
    async function fetchAuthorsFromTitle() {
      const res = await fetch(GBAPI + new URLSearchParams({q:`intitle:'${title}'`}))
      const data = await res.json()
      let authorArray = []
      data.items.map((item) => { authorArray.push(item.volumeInfo.authors)})
      let count = authorArray.reduce((acc, value) => ({
        ...acc,
        [value]: (acc[value] || 0) + 1
      }), {})
      const winner = Object.keys(count).filter(key => count[key] > 2 ).toString()
      if(winner.length > 0 && !authors[0].name) {
        setAuthors([{ name: winner }])
      }
    }
    fetchAuthorsFromTitle()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const book = {
      title: title,
      subTitle: subTitle,
      authors: authors
    }
    setLoading(true)
    createBooks(book)
      .then((response) => {
        if(response.data && !response.errorMessage) {
          setLoading(false)
          setAlert({ 
            show: true, 
            message: `${response.data.createBooks.title} successfully added` 
          })
          clearFields()
        } else if (!response.data && response.errorMessage) {
          setLoading(false)
          setAlert({
            show: true,
            message: `Error adding book: ${response.errorMessage}`
          })
        } else {
          setLoading(false)
          setAlert({
            show: true,
            message: "WTF happened? 🤷‍♂️"
          })
        }

      })
  }

  const handleAddAuthor = (e) => {
    e.preventDefault()
    setAuthors(authors.concat({name: ''}))
  }

  const handleDeleteAuthor = (e, index) => {
    e.preventDefault()
    let temp = [...authors]
    temp.splice(index, 1)
    setAuthors(temp)
  }

  const handleAuthorChange = (index, value) => {
    let newVal = [...authors]
    newVal[index] = {name: value}
    setAuthors(newVal)
  }

  const clearFields = () => {
    setTitle('')
    setSubTitle('')
    setAuthors([{ name: '' }])
  }

  const closeAlert = () => {
    setAlert({ show: false, message: '' })
  }

  return (
    <Container>
      <main>
        <h1>Add Book</h1>
        {
          alert.show ? (
            <Alert mb={4} variant="sucess">
              {alert.message}
              <Close ml='auto' sx={{minWidth: '32px'}} onClick={closeAlert} />
            </Alert>
          ) : null
        }
        {
          loading ?  
            ( <Box>
                <Spinner
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }} 
                />
              </Box> 
            )
          : 
            (
              <Box
                as="form"
                onSubmit={e => handleSubmit(e)}
              >
                <Label htmlFor="title">Title</Label>
                <Input
                  name="title"
                  placeholder="The Hobbit"
                  required
                  mb={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleLookAhead()}
                />
                <Label htmlFor="title">Subtitle</Label>
                  <Input
                    name="subTitle"
                    placeholder="There and Back Again"
                    mb={3}
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                  />
                <Label>{authors.length > 1 ? 'Authors' : 'Author'}</Label>
                {authors.map((author, index) => {
                  return (
                    <Flex key={`authors${index}`}>
                      <Box sx={{ flex: '1 1 auto' }}>
                        <Input
                          name={`authors${index}`}
                          placeholder={index === 0 ? 'J.R.R. Tolkien' : ''}
                          value={authors[index].name}
                          onChange={(e) => handleAuthorChange(index, e.target.value)}
                          mb={3}
                        />
                      </Box>
                      <Box>
                        {index === 0 &&
                          <Box key={index} as="button" 
                            sx={{height: '42px', ml: '6px'}}
                            onClick={e => handleAddAuthor(e)}
                            disabled={!authors[0].name}
                          >
                            <FaPlus />
                          </Box>
                        }
                        {index !== 0 &&
                          <Box key={index} as="button" 
                            sx={{height: '42px', ml: '6px'}}
                            onClick={e => handleDeleteAuthor(e, index)}
                          >
                            <FaMinus />
                          </Box>
                        } 
                      </Box>  
                    </Flex>
                  )
                })}
                <Button foo="bar" onSubmit={handleSubmit} disabled={!title || !authors[0].name}>Submit</Button>  
              </Box>
            )
          }
        </main>
      </Container>
  )
}
