// Guías: what the next delivery fills in. The sections are listed so the structure is visible in the demo.
import { Card, Row, Screen, Section, Text } from '@/ui/kit';

const COMING = [
  ['Clases de Horde Siege', 'Asalto, Irruptor, Tirador y Médico: qué hace cada una y cómo combinarlas'],
  ['Armas y modificaciones', 'Qué arma va con cada clase y qué cambió en los parches'],
  ['Mapas', 'Puntos de control, rutas y objetivos de cada mapa'],
  ['Coleccionables', 'Dónde están los de cada capítulo de la campaña'],
  ['Builds de la comunidad', 'Las combinaciones que usan las escuadras que llegan a la oleada 30'],
];

export default function Guias() {
  return (
    <Screen overline="Oficiales y de la comunidad" title="Guías">
      <Card priority>
        <Text variant="overline" tone="primary">En preparación</Text>
        <Text>Las guías llegan en la próxima entrega de la demo. Estas son las secciones.</Text>
      </Card>
      <Section title="Secciones">
        {COMING.map(([title, subtitle]) => <Row key={title} icon="book" title={title} subtitle={subtitle} />)}
      </Section>
    </Screen>
  );
}
