import React from 'react';
import { Card, CardContent, Box, Typography, CircularProgress, alpha } from '@mui/material';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color?: string;
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = '#1976d2',
  subtitle,
  loading = false,
  onClick,
}) => {
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: 6,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              gutterBottom
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {title}
            </Typography>
            {loading ? (
              <Box display="flex" alignItems="center" mt={2}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <>
                <Typography variant="h3" fontWeight={700} sx={{ color }} gutterBottom>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {subtitle}
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(color, 0.1),
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: 36,
                color,
              },
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
