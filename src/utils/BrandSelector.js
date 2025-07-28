import { Autocomplete, TextField, Box } from "@mui/material";

const BrandSelector = ({
    selectedBrand,
    setSelectedBrand,
    brandList,
    inputValueBrand,
    setInputValueBrand,
    brandLimit,
    setBrandLimit,
    isLoading,
    hasMore,
    toggleSelection,
    label = 'Brands',
    width = 190
}) => (
    <Box sx={{
        position: 'relative',
        paddingRight: '7.25%',
        width: `${width + 20}px`,
    }}>
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={[
                ...selectedBrand,
                ...brandList.filter(
                    (b) => !selectedBrand.some((sb) => sb.id === b.id)
                ),
            ]}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) =>
                option.id === value.id
            }
            inputValue={inputValueBrand}
            onInputChange={(event, newInputValue) => {
                setInputValueBrand(newInputValue);
                setBrandLimit(11);
            }}
            value={selectedBrand}
            onChange={(event, newValue) => {
                setSelectedBrand(newValue);
            }}
            renderTags={() => null}
            noOptionsText={inputValueBrand ? "No options" : ""}
            renderOption={(props, option) => {
                const isSelected = selectedBrand.some(
                    (b) => b.id === option.id
                );
                return (
                    <Box
                        component="li"
                        {...props}
                        onClick={() => toggleSelection(option)}
                        sx={{
                            backgroundColor: isSelected
                                ? "#b6d5f3 !important"
                                : "transparent",
                            fontSize: 13,
                            cursor: "pointer",
                        }}
                        key={option.id}
                    >
                        {option.name}
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Brands"
                    size="small"
                    placeholder="Search brands..."
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: <>{params.InputProps.endAdornment}</>,
                    }}
                />
            )}
            PopperComponent={(props) => (
                <Box
                    {...props}
                    sx={{
                        zIndex: 1300,
                        width: 220,
                        bgcolor: "white",
                        boxShadow: 3,
                        borderRadius: 1,
                        overflow: "auto",
                        maxHeight: 300,
                        position: "absolute",
                    }}
                    onScroll={(event) => {
                        const { scrollTop, scrollHeight, clientHeight } =
                            event.target;
                        if (
                            scrollTop + clientHeight >= scrollHeight - 5 &&
                            !isLoading &&
                            hasMore
                        ) {
                            setBrandLimit((prev) => prev + 10);
                        }
                    }}
                >
                    {/* {selectedBrand.length > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          overflowX: 'auto',
                          whiteSpace: 'nowrap',
                          gap: 1,
                          px: 1,
                          pt: 1,
                        }}
                      >
                        {selectedBrand.map((brand) => (
                          <Chip
                            key={brand.id}
                            label={brand.name}
                            size="small"
                            onDelete={() => handleRemove(brand.id)}
                            sx={{
                              backgroundColor: '#007bff',
                              color: '#fff',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              '.MuiChip-deleteIcon': {
                                color: '#fff',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )} */}
                    {props.children}
                    {/* {isLoading && <div style={{ padding: 8 }}>Loading more brands...</div>} */}
                </Box>
            )}
            sx={{
                "& .MuiInputBase-root": {
                    height: 40,
                    fontSize: 14,
                    width: 190,
                },
                "& input": {
                    fontSize: 13,
                },
            }}
        />
    </Box>
)
export default BrandSelector