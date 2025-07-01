import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid } from '@mui/material';

function ProductAttributes({ productAttribute }) {
  const [attributes, setAttributes] = useState({
    price: productAttribute.price,
    quantity: productAttribute.quantity,
    item_condition: productAttribute.item_condition,
    brand: productAttribute.brand.value,
    color: productAttribute.color.value,
    description: productAttribute.product_description || '',
    specialty: productAttribute.specialty.value,
    item_weight: productAttribute.item_weight.value,
    age_range_description: productAttribute.age_range_description.value,
    item_form: productAttribute.item_form.value,
    finish_type: productAttribute.finish_type.value,
    size: productAttribute.size.value,
    part_number: productAttribute.part_number.value,
    target_gender: productAttribute.target_gender.value,
    contains_liquid_contents: productAttribute.contains_liquid_contents.value,
    manufacturer: productAttribute.manufacturer.value,
    ingredients: productAttribute.ingredients.value,
    product_benefit: productAttribute.product_benefit.value,
    fc_shelf_life: productAttribute.fc_shelf_life.value,
    sun_protection: productAttribute.sun_protection.value,
    skin_type: productAttribute.skin_type.value,
    item_package_weight: productAttribute.item_package_weight.value,
    // Add all attributes here
    special_ingredients: productAttribute.special_ingredients.value,
    skin_tone: productAttribute.skin_tone.value,
    liquid_volume: productAttribute.liquid_volume.value,
    item_name: productAttribute.item_name.value,
    externally_assigned_product_identifier: productAttribute.externally_assigned_product_identifier[0]?.value || '',
    part_number: productAttribute.part_number.value,
    model_name: productAttribute.model_name.value,
    model_number: productAttribute.model_number.value,
    number_of_items: productAttribute.number_of_items.value,
    // Continue adding all necessary attributes
  });

  useEffect(() => {
    console.log(productAttribute, 'Updated product attributes');
  }, [productAttribute]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAttributes((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated attributes:', attributes);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Render all attributes dynamically */}
        {Object.keys(attributes).map((key) => {
          const attributeValue = attributes[key];
          return (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                fullWidth
                label={key.replace(/_/g, ' ').toUpperCase()}
                name={key}
                value={attributeValue}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  fontSize: '14px',
                  height: '45px',
                  '& .MuiInputBase-root': {
                    height: '100%',
                  },
                }}
              />
            </Grid>
          );
        })}

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit" sx={{ fontSize: '14px', height: '45px' }}>
            Update Product
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default ProductAttributes;
