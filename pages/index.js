import React, { useState } from "react";
import { Container, Col, Row, Form } from "react-bootstrap";

import Head from "pages/head";
import BrutalityByState from "components/widgets/BrutalityByState";
import BrutalityOverTime from "components/widgets/BrutalityOverTime";
import BrutalityMap from "components/widgets/BrutalityMap";
import EnhancedTable from "components/widgets/TableData";
import Last20Victims from "components/widgets/Last20Victims";
import { getApiData } from "server/routes/appRoutes";

export const getServerSideProps = async () => {
  const shootingsByState = await getApiData("count/shootings/state/name");
  const populationDataRaw = await fetch(
    "https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest"
    );
  const shootingsOverTimeRaw = await getApiData("count/shootings/overtime");
  const populationData = await populationDataRaw.json();

  const shootingsOverTime = await JSON.parse(JSON.stringify(shootingsOverTimeRaw));

  const filteredShootingsByState = shootingsByState.filter((state) =>
    populationData.data.find((s) => s.State === state.state)
  );
  const shootingsPerCapita = filteredShootingsByState.map((state) => ({
    ...state,
    total:
      state.total /
      populationData.data.find((s) => s.State === state.state).Population,
  }));

  return {
    props: {
      shootingsByState: filteredShootingsByState,
      shootingsPerCapita,
      shootingsOverTime,
    },
  };
};

function HomePage({ shootingsByState, shootingsPerCapita, shootingsOverTime }) {
  const [isPerCapita, setIsPerCapita] = useState(false);

  return (
    <Container>
      <Head />

      <Row>
        <Col lg={8}>
          <h2>Police Killings by State</h2>
          <Form.Check
            type="switch"
            id="custom-switch"
            label="Per Capita"
            onChange={(val) => {
              setIsPerCapita(val.target.checked);
            }}
          />
          <BrutalityMap
            data={isPerCapita ? shootingsPerCapita : shootingsByState}
          />
          <BrutalityByState
            data={isPerCapita ? shootingsPerCapita : shootingsByState}
          />
        </Col>

        <Col lg={4}>
          <h2>Most Recent Police Killings</h2>
          <Last20Victims />
          <BrutalityOverTime data={shootingsOverTime}/>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <h2>Police Brutality by the Numbers</h2>
          <EnhancedTable />
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
