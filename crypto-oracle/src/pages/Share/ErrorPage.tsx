import { FC } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Stack,
} from "@chakra-ui/react";

type ErrorPageProps = { error: any; resetErrorBoundary: any };

const ErrorPage: FC<ErrorPageProps> = ({ error, resetErrorBoundary }) => {
  return (
    <Stack m={20}>
      <Alert status="error">
        <AlertIcon />
        <Stack>
          <AlertTitle>{error.message}</AlertTitle>
          <AlertDescription>Something went wrong:</AlertDescription>
        </Stack>
      </Alert>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </Stack>
  );
};

export default ErrorPage;
