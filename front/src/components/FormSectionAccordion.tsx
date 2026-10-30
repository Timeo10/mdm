import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Props = {
  title: string;
  defaultExpanded?: boolean;
  sx?: any;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function FormSectionAccordion({
  title,
  defaultExpanded = false,
  sx,
  actions,
  children,
}: Props) {
  return (
    <Accordion defaultExpanded={defaultExpanded} sx={sx}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" width="100%">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {actions}
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
