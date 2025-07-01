import React, { useState } from "react";
import { Popper, Paper, Typography, Box, ClickAwayListener, Button, styled } from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';

const StyledButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  fontSize: '12px',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const TooltipName = ({ children, title, onRunCerebro, onAnalyzeListing }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{ display: "inline-block", cursor: 'pointer' }}
      >
        {children}
      </Box>

      <Popper open={open} anchorEl={anchorEl} placement="top-start" disablePortal sx={{ zIndex: 1500 }}>
        <ClickAwayListener onClickAway={handleMouseLeave}>
          <Paper
            sx={{
              p: 1,
              maxWidth: 300,
              backgroundColor: "#fff",
              boxShadow: 'none',
              borderRadius: 1,
              border: '1px solid rgb(143, 155, 166)',


            }}
          >
            <Typography
              mb={1}
              sx={{
                color: '#485E75',
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: 14,
                wordBreak: 'break-word'
              }}
            >
              {title}
            </Typography>
            {/* <Box sx={{ display: "flex", gap: 1 ,padding:'5px'}}>
              {onRunCerebro && (
                <StyledButton size="small" onClick={onRunCerebro}>
                  <LaunchIcon sx={{ fontSize: 14 }} />
                  Run Cerebro
                </StyledButton>
              )}
              {onAnalyzeListing && (
                <StyledButton size="small" onClick={onAnalyzeListing}>
                  <LaunchIcon sx={{ fontSize: 14 }} />
                  Analyze Listing
                </StyledButton>
              )}
            </Box> */}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default TooltipName;
