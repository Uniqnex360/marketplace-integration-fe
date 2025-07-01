import React, { useState, useEffect } from 'react';
import {
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  FormControlLabel,
  Grid,
  Button, Typography, Chip,Select, MenuItem
} from '@mui/material';

function ProductAttributes({ productAttribute }) {
  // Initialize state with product attributes and default to empty strings or safe values
  const [attributes, setAttributes] = useState({
    batteries_included: productAttribute?.batteries_included?.value || false,
    batteries_required: productAttribute?.batteries_required?.value || false,
    container: productAttribute?.container?.type?.[0]?.language_tag || '',
    contains_liquid_contents: productAttribute?.contains_liquid_contents?.value || false,
    directions: productAttribute?.directions?.value || '',
    externally_assigned_product_identifier: productAttribute?.externally_assigned_product_identifier || [],
    fc_shelf_life: productAttribute?.fc_shelf_life?.value || '',
    directions: productAttribute?.directions?.value || '',
    is_expiration_dated_product: productAttribute?.is_expiration_dated_product?.value || false,
    is_heat_sensitive: productAttribute?.is_heat_sensitive?.value || false,
    is_liquid_double_sealed: productAttribute?.is_liquid_double_sealed?.value || false,
    item_dimensions: productAttribute?.item_dimensions || { width: { value: 0 }, length: { value: 0 } },
    item_name: productAttribute?.item_name?.value || '',
    item_package_dimensions: productAttribute?.item_package_dimensions || { length: { value: 0 }, width: { value: 0 } },
    item_package_quantity: productAttribute?.item_package_quantity?.value || 1,
    item_package_weight: productAttribute?.item_package_weight || { unit: 'kg', value: 0 },
      price: productAttribute?.price || '',
    quantity: productAttribute?.quantity || '',
    item_condition: productAttribute?.item_condition || '',
    brand: productAttribute?.brand?.value || '',
    color: productAttribute?.color?.value || '',
    description: productAttribute?.product_description || '',
    specialty: productAttribute?.specialty?.value || '',
    age_range_description: productAttribute?.age_range_description?.value || '',
    item_form: productAttribute?.item_form?.value || '',
    finish_type: productAttribute?.finish_type?.value || '',
      target_gender: productAttribute?.target_gender?.value || '',
    contains_liquid_contents: productAttribute?.contains_liquid_contents?.value || false,
    manufacturer: productAttribute?.manufacturer?.value || '',
    ingredients: productAttribute?.ingredients?.value || '',
     fc_shelf_life: productAttribute?.fc_shelf_life?.value || '',
    sun_protection: productAttribute?.sun_protection?.value || '',
       item_type_keyword: productAttribute?.item_type_keyword?.value || '',
    item_weight: productAttribute?.item_weight || { unit: 'grams', value: 0 },
    liquid_volume: productAttribute?.liquid_volume || { unit: 'milliliters', value: 0 },
    manufacturer: productAttribute?.manufacturer?.value || '',
    material_type_free: productAttribute?.material_type_free?.value || '',
    model_name: productAttribute?.model_name?.value || '',
    model_number: productAttribute?.model_number?.value || '',
    number_of_items: productAttribute?.number_of_items?.value || 1,
    package_level: productAttribute?.package_level?.value || '',
    package_type_name: productAttribute?.package_type_name || '',
    part_number: productAttribute?.part_number?.value || '',
    product_benefit: productAttribute?.product_benefit?.value || '',
    product_expiration_type: productAttribute?.product_expiration_type?.value || '',
    product_site_launch_date: productAttribute?.product_site_launch_date?.value || '',
    size: productAttribute?.size?.value || '',
    skin_tone: productAttribute?.skin_tone?.value || '',
    skin_type: productAttribute?.skin_type?.value || '',
    special_feature: productAttribute?.special_feature?.value || '',
    special_ingredients: productAttribute?.special_ingredients?.value || '',
    specialty: productAttribute?.specialty?.value || '',
    street_date: productAttribute?.street_date?.value || '',
    sun_protection: productAttribute?.sun_protection || { unit: 'spf', value: '10' },
    supplier_declared_dg_hz_regulation: productAttribute?.supplier_declared_dg_hz_regulation?.value || '',
    target_gender: productAttribute?.target_gender?.value || '',
    unit_count: productAttribute?.unit_count?.value || 1,
    unspsc_code: productAttribute?.unspsc_code?.value || '',
  });

  // Effect to log whenever productAttribute changes
  useEffect(() => {
    console.log(productAttribute, 'Updated product attributes');
  }, [productAttribute]);

  // Handle change for input fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAttributes((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission (to update the attributes)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated attributes:', attributes);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
  <TextField
    label="Color"
    name="color"
    fullWidth
    value={attributes.color}
    onChange={handleChange}
    sx={{
      '& .MuiInputBase-root': {
        height: '40px', // Reduce height
      },
      '& .MuiInputLabel-root': {
        fontSize: '0.875rem', // Optional: Reduce label size
      },
    }}
  />
</Grid>

<Grid item xs={12} sm={3} sx={{marginLeft:'5px'}}>
  <TextField
    label="Container Type"
    name="container"
    fullWidth
    value={attributes.container}
    onChange={handleChange}
    sx={{
      '& .MuiInputBase-root': {
        height: '40px', // Reduce height
      },
      '& .MuiInputLabel-root': {
        fontSize: '0.875rem', // Optional: Reduce label size
      },
    }}
  />
</Grid>

<Grid item xs={12} sm={3}>
               <TextField
            label="Quantity"
            name="item_package_quantity"
            type="number"
            fullWidth
            value={attributes.item_package_quantity}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>

        <Grid container spacing={2} sx={{marginTop:'3px', marginLeft:'13px'}}>

        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1">Batteries Included</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={attributes.batteries_included}
                onChange={handleChange}
                name="batteries_included"
              />
            }
            label={attributes.batteries_included ? "Yes" : "No"}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1">Batteries Required</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={attributes.batteries_required}
                onChange={handleChange}
                name="batteries_required"
              />
            }
            label={attributes.batteries_required ? "Yes" : "No"}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1">Contains Liquid Contents</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={attributes.contains_liquid_contents}
                onChange={handleChange}
                name="contains_liquid_contents"
              />
            }
            label={attributes.contains_liquid_contents ? "Yes" : "No"}
          />
        </Grid>
        </Grid>

        <Grid item xs={12} >
             <TextField
            label="Directions"
            name="directions"
            fullWidth
            multiline
            rows={4}
            value={attributes.directions}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sx={{marginLeft:'5px'}}>
        <Typography variant="subtitle1">External Identifiers</Typography>
             <Grid container spacing={1}>
            {attributes.externally_assigned_product_identifier.map((id) => (
              <Grid item key={id.value}>
                <Chip label={`${id.type}: ${id.value}`} color="secondary" />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{marginTop:'3px', marginLeft:'10px'}}>
  {/* Manufacturer */}
  <Grid item xs={12} sm={4}>

          <TextField
            label="Color"
            name="color"
            fullWidth
            value={attributes.color}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>

       

        <Grid item  sm={3}>
          <TextField
            label="Specialty"
            name="specialty"
            fullWidth
            value={attributes.specialty}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>

        <Grid item sm={2}>
          <TextField
            label="Age Range"
            name="age_range_description"
            fullWidth
            value={attributes.age_range_description}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>
        
        <Grid item sm={3}>
          <TextField
            label="Item Form"
            name="item_form"
            fullWidth
            value={attributes.item_form}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>

        <Grid item  sm={3}>
          <TextField
            label="Finish Type"
            name="finish_type"
            fullWidth
            value={attributes.finish_type}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>
        <Grid item  sm={3}>
          <TextField
            label="Item Weight (grams)"
            name="item_weight"
            type="number"
            fullWidth
            value={attributes.item_weight}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Size"
            name="size"
            fullWidth
            value={attributes.size}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>
        </Grid>
       
       

        <Grid container spacing={2} sx={{marginTop:'3px', marginLeft:'10px'}}>

      

      

      
</Grid>
     
<Grid container spacing={2} sx={{ marginTop: '3px', marginLeft: '10px' }}>
  
  {/* Contains Liquid Contents Checkbox */}
  <Grid item xs={12} sm={4}> {/* Adjust width here */}
    <FormControlLabel
      control={
        <Checkbox
          checked={attributes.contains_liquid_contents}
          onChange={handleChange}
          name="contains_liquid_contents"
        />
      }
      label="Contains Liquid Contents"
    />
  </Grid>

  {/* Manufacturer TextField */}
  <Grid item xs={12} sm={4}> {/* Adjust width here */}
    <TextField
      label="Manufacturer"
      name="manufacturer"
      fullWidth
      value={attributes.manufacturer}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        }
      }}
    />
  </Grid>

  {/* UNSPSC Code TextField */}
  <Grid item xs={12} sm={4}> {/* Adjust width here */}
    <TextField
      label="UNSPSC Code"
      name="unspsc_code"
      fullWidth
      value={attributes.unspsc_code}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        }
      }}
    />
  </Grid>
  
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Ingredients"
            name="ingredients"
            multiline
            rows={4}
            fullWidth
            value={attributes.ingredients}
            onChange={handleChange}

          />
        </Grid>
        <Grid container spacing={2} sx={{marginTop:'3px', marginLeft:'10px'}}>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Product Benefit"
            name="product_benefit"
            fullWidth
            value={attributes.product_benefit}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="FC Shelf Life (days)"
            name="fc_shelf_life"
            type="number"
            fullWidth
            value={attributes.fc_shelf_life}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
  <TextField
    label="Sun Protection"
    name="sun_protection.value"  // Reference the value property inside the sun_protection object
    fullWidth
    value={attributes.sun_protection?.value || ''} // Access sun_protection.value safely
    onChange={handleChange}
    sx={{
      '& .MuiInputBase-root': {
        height: '40px', // Reduce height
      }
    }}
  />
</Grid>
</Grid>
<Grid container spacing={2} sx={{marginTop:'3px', marginLeft:'10px'}}>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Skin Type"
            name="skin_type"
            fullWidth
            value={attributes.skin_type}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>
       

    

        <Grid item xs={8}>
             <TextField
            label="Item Name"
            name="item_name"
            fullWidth
            value={attributes.item_name}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce height
                }}}
          />
        </Grid>

      </Grid>

        <Grid item xs={12}>
              <TextField
            label="Directions"
            name="directions"
            fullWidth
            multiline
            rows={4}
            value={attributes.directions}
            onChange={handleChange}
          
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Item Dimensions (Width x Length)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (inches)"
                name="item_dimensions.width"
                type="number"
                fullWidth
                value={attributes.item_dimensions.width}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    }}}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Length (inches)"
                name="item_dimensions.length"
                type="number"
                fullWidth
                value={attributes.item_dimensions.length}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    }}}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Item Package Dimensions</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (cm)"
                name="item_package_dimensions.width"
                type="number"
                fullWidth
                value={attributes.item_package_dimensions.width}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    }}}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Length (cm)"
                name="item_package_dimensions.length"
                type="number"
                fullWidth
                value={attributes.item_package_dimensions.length}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    }}}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
              <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Weight (grams)"
                name="item_weight.value"
                type="number"
                fullWidth
                value={attributes.item_weight.value}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    }}}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Unit"
                name="item_weight.unit"
                fullWidth
                value={attributes.item_weight.unit}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    }}}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Weight (kg)"
                name="item_package_weight.value"
                type="number"
                fullWidth
                value={attributes.item_package_weight.value}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    }}}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Unit"
                name="item_package_weight.unit"
                fullWidth
                value={attributes.item_package_weight.unit}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    }}}
              />
            </Grid>
          </Grid>
        </Grid>

   

        <Grid item xs={12}>
          <Typography variant="subtitle1">Expiration Date Product</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={attributes.is_expiration_dated_product}
                onChange={handleChange}
                name="is_expiration_dated_product"
              />
            }
            label={attributes.is_expiration_dated_product ? "Yes" : "No"}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1">Heat Sensitive</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={attributes.is_heat_sensitive}
                onChange={handleChange}
                name="is_heat_sensitive"
              />
            }
            label={attributes.is_heat_sensitive ? "Yes" : "No"}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1">Liquid Double Sealed</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={attributes.is_liquid_double_sealed}
                onChange={handleChange}
                name="is_liquid_double_sealed"
              />
            }
            label={attributes.is_liquid_double_sealed ? "Yes" : "No"}
          />
        </Grid>


      

        {/* Item Package Weight */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Item Package Weight</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Weight"
                name="item_package_weight.value"
                type="number"
                fullWidth
                value={attributes.item_package_weight.value}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    },
                   
                  }}
              />
            </Grid>
            <Grid item xs={6}>
  <FormControl fullWidth>
    <InputLabel>Unit</InputLabel>
    <Select
      label="Unit"
      name="item_package_weight.unit"
      value={attributes.item_package_weight.unit}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce the height of the select input field
        },
        '& .MuiSelect-select': {
          paddingTop: '10px',  // Adjust padding inside the select to center text
          paddingBottom: '10px', // Adjust padding inside the select to center text
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem', // Optional: Adjust label font size
        },
      }}
    >
      <MenuItem value="kg">Kilograms</MenuItem>
      <MenuItem value="grams">Grams</MenuItem>
    </Select>
  </FormControl>
</Grid>
</Grid>

        </Grid>


        {/* Item Weight */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Item Weight</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Weight"
                name="item_weight.value"
                type="number"
                fullWidth
                value={attributes.item_weight.value}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    },
                   
                  }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  label="Unit"
                  name="item_weight.unit"
                  value={attributes.item_weight.unit}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce the height of the select input field
                    },
                    '& .MuiSelect-select': {
                      paddingTop: '10px',  // Adjust padding inside the select to center text
                      paddingBottom: '10px', // Adjust padding inside the select to center text
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem', // Optional: Adjust label font size
                    },
                  }}
                >
                  <MenuItem value="grams">Grams</MenuItem>
                  <MenuItem value="kilograms">Kilograms</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        {/* Liquid Volume */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Liquid Volume</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Volume"
                name="liquid_volume.value"
                type="number"
                fullWidth
                value={attributes.liquid_volume.value}
                onChange={handleChange}
                sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce height
                    },
                   
                  }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  label="Unit"
                  name="liquid_volume.unit"
                  value={attributes.liquid_volume.unit}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px', // Reduce the height of the select input field
                    },
                    '& .MuiSelect-select': {
                      paddingTop: '10px',  // Adjust padding inside the select to center text
                      paddingBottom: '10px', // Adjust padding inside the select to center text
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem', // Optional: Adjust label font size
                    },
                  }}
                >
                  <MenuItem value="milliliters">Milliliters</MenuItem>
                  <MenuItem value="liters">Liters</MenuItem>
                </Select>
              </FormControl>
            </Grid>

                 {/* Item Type Keyword */}
        <Grid item xs={6}>
               <TextField
            label="Item Type"
            name="item_type_keyword"
            fullWidth
            value={attributes.item_type_keyword}
            onChange={handleChange}
            sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Reduce the height of the select input field
                },
            }}
          />
        </Grid>
          </Grid>

          
   
        </Grid>

        <Grid container spacing={2} sx={{marginTop:'3px', marginLeft:'3px'}}>
  {/* Manufacturer */}


  {/* Material Type Free */}
  <Grid item xs={12} sm={4}>
    <TextField
      label="Material Type Free"
      name="material_type_free"
      fullWidth
      value={attributes.material_type_free}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        },
       
      }}
    />
  </Grid>

  {/* Model Name */}
  <Grid item xs={12} sm={4}>
    <TextField
      label="Model Name"
      name="model_name"
      fullWidth
      value={attributes.model_name}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        },
       
      }}
    />
  </Grid>

  {/* Model Number */}
  <Grid item xs={12} sm={4}>
    <TextField
      label="Model Number"
      name="model_number"
      fullWidth
      value={attributes.model_number}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        },
       
      }}
    />
  </Grid>

  {/* Number of Items */}
  <Grid item xs={12} sm={4}>
    <TextField
      label="Number of Items"
      name="number_of_items"
      type="number"
      fullWidth
      value={attributes.number_of_items}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem', // Optional: Reduce label size
        },
      }}
    />
  </Grid>

  {/* Package Level */}
  <Grid item xs={12} sm={4}>
    <TextField
      label="Package Level"
      name="package_level"
      fullWidth
      value={attributes.package_level}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem', // Optional: Reduce label size
        },
      }}
    />
  </Grid>

  {/* Package Type Name */}
  <Grid item xs={12} sm={4}>
    <TextField
      label="Package Type"
      name="package_type_name"
      fullWidth
      value={attributes.package_type_name}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        }}}
    />
  </Grid>

  {/* Part Number */}
  <Grid item xs={12} sm={4}>
    <TextField
      label="Part Number"
      name="part_number"
      fullWidth
      value={attributes.part_number}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        }}}
    />
  </Grid>

  {/* Product Expiration Type */}
  <Grid item xs={12} sm={4}>
    <TextField
      label="Expiration Type"
      name="product_expiration_type"
      fullWidth
      value={attributes.product_expiration_type}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        }}}
    />
  </Grid>

  <Grid item xs={12} sm={4}>
  <TextField
    label="Launch Date"
    name="product_site_launch_date"
    type="datetime-local"
    fullWidth
    value={attributes.product_site_launch_date ? 
      new Date(attributes.product_site_launch_date).toISOString().slice(0, 16) : ''} // Format the date
    onChange={handleChange}
    InputLabelProps={{ shrink: true }}
    sx={{
      '& .MuiInputBase-root': {
        height: '40px', // Reduce height
      }
    }}
  />
</Grid>

  

  <Grid item xs={12} sm={4}>
    <TextField
      label="Target Gender"
      name="target_gender"
      fullWidth
      value={attributes.target_gender}
      onChange={handleChange}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Reduce height
        }}}
    />
  </Grid>



</Grid>

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Update Product
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default ProductAttributes;
