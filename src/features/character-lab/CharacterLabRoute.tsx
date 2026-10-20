import { CharacterLabApp } from './CharacterLabApp';
import '../../ui/game-ui.css';
import './styles/character-lab.css';

/** Isolated design laboratory: all characters and stats are non-canonical fixtures. */
export default function CharacterLabRoute() {
  return <div id="vyr-character-lab"><CharacterLabApp /></div>;
}
