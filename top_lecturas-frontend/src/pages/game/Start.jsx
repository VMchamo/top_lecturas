import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { userContext } from 'src/userContext';
import GameService from 'src/services/game';
import Button from 'src/components/forms/Button';
import Loading from 'src/components/Loading';

export default function Start() {
    const { user, ready } = userContext();
    const [disabledBtn, setDisabledBtn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');

    const [articles, setArticles] = useState([]);
    const [totalPoints, setTotalPoints] = useState();
    const [totalWinStreaks, setTotalWinStreaks] = useState();
    const [lastWinStreak, setLastWinStreak] = useState();

    useEffect(() => {
        startGame();
    }, []);

    function startGame() {
        if (isLoading) return;

        setDisabledBtn(true);
        setIsLoading(true);

        GameService.getArticles()
            .then((data) => {
                setArticles(data.options);
                setTotalPoints(data.total_points);
                setTotalWinStreaks(data.total_win_streaks);
                setLastWinStreak(data.last_win_streak);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setStatus('');
                setDisabledBtn(false);
                setIsLoading(false);
            });
    }

    async function handleArticleSubmit(e) {
        e.preventDefault();
        if (isLoading) return;

        setDisabledBtn(true);
        setIsLoading(true);

        await GameService.sendOption({ article: e.target.textContent })
            .then((data) => {
                data.gameOver ? setStatus(data.gameOver) : setStatus(data.keepGoing);
                setArticles([]);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setDisabledBtn(false);
                setIsLoading(false);
            });
    }

    async function handleStartGame(e) {
        e.preventDefault();
        setDisabledBtn(true);
        startGame();
    }

    if (!ready && isLoading) {
        return <Loading />;
    }

    if (ready && !user) {
        return <Navigate to={'/login'} />;
    }

    if (status === 'keepGoing') {
        startGame();
    }

    if (status === 'gameOver') {
        return (
            <div className="my-12 grow flex flex-col items-center">
                <div className="max-w-md w-full bg-white p-6 shadow-md rounded-xl">
                    <p className="mb-4 text-2xl text-center">Juego terminado: Perdiste</p>
                    <Button
                        type="submit"
                        name="jugar_de_nuevo"
                        value="Jugar de nuevo"
                        disabled={disabledBtn}
                        onClick={handleStartGame}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="my-8 w-full grow flex flex-col items-center justify-around">
            <div className="max-w-7xl w-full flex gap-4 justify-around">
                {articles.length === 0 ? <Loading /> : ''}
                {articles.map((item) => (
                    <div key={item.id} className="w-2/4">
                        <form>
                            <input
                                type="hidden"
                                name="option"
                                value={item.article}
                                readOnly
                            />
                            <Button
                                type="submit"
                                name={item.id}
                                value={item.article}
                                disabled={disabledBtn}
                                onClick={handleArticleSubmit}
                            />
                        </form>
                    </div>
                ))}
            </div>
            <div className="m-4 text-3xl flex gap-8 justify-evenly">
                <div>Racha actual: {lastWinStreak}</div>
                <div>Tu mejor racha: {totalWinStreaks}</div>
                <div>Puntos totales: {totalPoints}</div>
            </div>
        </div>
    );
}
