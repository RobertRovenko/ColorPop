import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Button,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GRID_SIZE = 7;
const BASE_COLORS = ["red", "green", "blue"];
const ADDITIONAL_COLORS = ["orange", "purple"];

const generateGrid = (colors) => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      color: colors[Math.floor(Math.random() * colors.length)],
      animatedValue: new Animated.Value(1),
    }))
  );
};

const AnimatedBall = ({ color, animatedValue }) => {
  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <View style={[styles.ball, { backgroundColor: color }]}>
        <Text></Text>
      </View>
    </Animated.View>
  );
};

export default function Game() {
  const [grid, setGrid] = useState(generateGrid(BASE_COLORS));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [colors, setColors] = useState(BASE_COLORS);
  const [gameOver, setGameOver] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHighScore();

    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 2,
          duration: 5000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 3,
          duration: 5000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const titleColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ["red", "green", "blue", "red"],
  });

  useEffect(() => {
    if (score >= 150) {
      setColors([...BASE_COLORS, ...ADDITIONAL_COLORS]);
    } else if (score >= 75) {
      setColors([...BASE_COLORS, "orange"]);
    }
  }, [score]);

  const loadHighScore = async () => {
    try {
      const savedHighScore = await AsyncStorage.getItem("highScore");
      if (savedHighScore !== null) {
        setHighScore(parseInt(savedHighScore, 10));
      }
    } catch (error) {
      console.error("Failed to load high score:", error);
    }
  };

  const saveHighScore = async (newHighScore) => {
    try {
      await AsyncStorage.setItem("highScore", newHighScore.toString());
    } catch (error) {
      console.error("Failed to save high score:", error);
    }
  };

  const popBalls = (x, y) => {
    if (isPopping) return;

    setIsPopping(true);

    const colorToPop = grid[x][y].color;
    const stack = [[x, y]];
    const toPop = new Set();

    while (stack.length) {
      const [cx, cy] = stack.pop();
      if (grid[cx][cy].color === colorToPop) {
        toPop.add(`${cx}-${cy}`);
        [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ].forEach(([nx, ny]) => {
          if (
            nx >= 0 &&
            ny >= 0 &&
            nx < GRID_SIZE &&
            ny < GRID_SIZE &&
            grid[nx][ny].color === colorToPop &&
            !toPop.has(`${nx}-${ny}`)
          ) {
            stack.push([nx, ny]);
          }
        });
      }
    }

    if (toPop.size >= 3) {
      const newScore = score + toPop.size;
      setScore(newScore);
      const columnsToUpdate = new Set();

      const poppingAnimations = Array.from(toPop).map((key) => {
        const [px, py] = key.split("-").map(Number);
        columnsToUpdate.add(py);
        return new Promise((resolve) => {
          Animated.timing(grid[px][py].animatedValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(resolve);
        });
      });

      Promise.all(poppingAnimations).then(() => {
        const newGrid = grid.map((row) => row.slice());
        toPop.forEach((key) => {
          const [px, py] = key.split("-").map(Number);
          newGrid[px][py] = null;
          columnsToUpdate.add(py);
        });

        // Update only affected columns
        columnsToUpdate.forEach((col) => {
          for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (!newGrid[row][col]) {
              for (let k = row - 1; k >= 0; k--) {
                if (newGrid[k][col]) {
                  newGrid[row][col] = newGrid[k][col];
                  newGrid[k][col] = null;
                  break;
                }
              }
            }
          }

          // Generate new balls for empty spaces at the top of affected columns
          for (let row = 0; row < GRID_SIZE; row++) {
            if (!newGrid[row][col]) {
              newGrid[row][col] = {
                color: colors[Math.floor(Math.random() * colors.length)],
                animatedValue: new Animated.Value(1),
              };
            }
          }
        });

        setGrid(newGrid);
        setIsPopping(false);

        // Check for valid moves after updating the grid
        if (!hasValidMoves(newGrid)) {
          setGameOver(true);
          if (newScore > highScore) {
            setHighScore(newScore);
            saveHighScore(newScore);
          }
        }
      });
    } else {
      setIsPopping(false);
    }
  };

  const hasValidMoves = (grid) => {
    const visited = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(false)
    );

    const isValidMove = (x, y, color) => {
      const stack = [[x, y]];
      let count = 0;

      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (
          cx >= 0 &&
          cy >= 0 &&
          cx < GRID_SIZE &&
          cy < GRID_SIZE &&
          grid[cx][cy].color === color &&
          !visited[cx][cy]
        ) {
          visited[cx][cy] = true;
          count++;
          [
            [cx - 1, cy],
            [cx + 1, cy],
            [cx, cy - 1],
            [cx, cy + 1],
          ].forEach(([nx, ny]) => {
            if (
              nx >= 0 &&
              ny >= 0 &&
              nx < GRID_SIZE &&
              ny < GRID_SIZE &&
              grid[nx][ny].color === color &&
              !visited[nx][ny]
            ) {
              stack.push([nx, ny]);
            }
          });
        }
      }

      return count >= 3;
    };

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!visited[x][y] && isValidMove(x, y, grid[x][y].color)) {
          return true;
        }
      }
    }

    return false;
  };

  const handleRestart = () => {
    setGrid(generateGrid(BASE_COLORS));
    setScore(0);
    setColors(BASE_COLORS);
    setGameOver(false);
  };

  const renderBall = (ball, x, y) => (
    <TouchableOpacity
      key={`${x}-${y}`}
      onPress={() => popBalls(x, y)}
      style={styles.ballContainer}
      disabled={isPopping}
    >
      <AnimatedBall color={ball.color} animatedValue={ball.animatedValue} />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.Text style={[styles.title, { color: titleColor }]}>
        ColorPop
      </Animated.Text>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.highScore}>High Score: {highScore}</Text>
      {grid.map((row, x) => (
        <View key={x} style={styles.row}>
          {row.map((ball, y) =>
            ball ? (
              renderBall(ball, x, y)
            ) : (
              <View key={`${x}-${y}`} style={styles.ballContainer} />
            )
          )}
        </View>
      ))}
      {gameOver && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={gameOver}
          onRequestClose={() => setGameOver(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              <Text style={styles.gameOverText}>Game Over</Text>
              <Text style={styles.finalScore}>Final Score: {score}</Text>
              <Button title="Restart" onPress={handleRestart} />
            </View>
          </View>
        </Modal>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 100,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
  },
  ballContainer: {
    width: 50, // Increased size
    height: 50, // Increased size
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  ball: {
    width: 46, // Increased size
    height: 46, // Increased size
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 23, // Increased size to make the balls round
  },
  score: {
    fontSize: 24,
    marginBottom: 10,
  },
  highScore: {
    fontSize: 20,
    marginBottom: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  gameOverText: {
    fontSize: 24,
    marginBottom: 10,
  },
  finalScore: {
    fontSize: 20,
    marginBottom: 20,
  },
});
