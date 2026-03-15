import { ChevronRight } from "lucide-react";

import Button from "./components/atoms/Button";
import Dropzone from "./components/organisms/Dropzone";
import Table from "./components/organisms/Table";

function App() {
  return (
    <div className="p-6">
      <Button variant="primary">Click me</Button>
      <Button variant="neutral">Click me</Button>
      <Button variant="destructive">Click me</Button>
      <div className="mt-8">
        <Dropzone label="something" />
      </div>
      <div className="mt-8">
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>John Doe</Table.Cell>
              <Table.Cell>john@example.com</Table.Cell>
              <Table.Cell>Admin</Table.Cell>
              <Table.Cell align="right">
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Jane Smith</Table.Cell>
              <Table.Cell>jane@example.com</Table.Cell>
              <Table.Cell>User</Table.Cell>
              <Table.Cell align="right">
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Bob Johnson</Table.Cell>
              <Table.Cell>bob@example.com</Table.Cell>
              <Table.Cell>Guest</Table.Cell>
              <Table.Cell align="right">
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default App;
