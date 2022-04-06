import { useEffect, useState } from "react"

import { useField } from "formik"

import { Chip, Autocomplete, TextField, CircularProgress } from "@mui/material"

import topicService from "../services/topicService"

export default function TopicsAutocomplete(props) {
  const { label, selectedTopics, showNotification } = props

  const [topics, setTopics] = useState([])
  const [choosedTopics, setChoosedTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")

  const [, , helpers] = useField("topics")

  const { setValue } = helpers

  async function getAllTopics() {
    setLoading(true)

    try {
      const { data } = await topicService.getAll({ page_size: 20, search: query })

      setTopics([...choosedTopics, ...data.results])
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllTopics()
  }, [query])

  useEffect(() => {
    setChoosedTopics(selectedTopics)
  }, [selectedTopics])

  useEffect(() => {
    setValue(choosedTopics)
  }, [choosedTopics])

  return (
    <Autocomplete
      multiple
      filterSelectedOptions
      loading={loading}
      options={topics}
      value={choosedTopics}
      filterOptions={x => x}
      onOpen={() => getAllTopics()}
      onClose={() => setTopics([])}
      isOptionEqualToValue={(option, value) => option?.id === value.id}
      getOptionLabel={option => option.name || ""}
      onChange={(_e, value) => setChoosedTopics(value)}
      onInputChange={(_e, value) => setQuery(value)}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={option?.name} {...getTagProps({ index })} />
        ))
      }
      renderInput={params => {
        return (
          <TextField
            {...params}
            variant="outlined"
            label={label}
            placeholder="Tema..."
            required={choosedTopics.length == 0}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )
      }}
    />
  )
}
