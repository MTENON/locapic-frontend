import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { addPlace, removePlace } from '../reducers/user';

const link = process.env.EXPO_PUBLIC_BACK_LINK

export default function PlacesScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  const [city, setCity] = useState('');

  useEffect(() => {

    //Appel de la route GET
    fetch(`${link}/places/${user.nickname}`).then(response => response.json())
      .then(data => {
        if (data.result) {
          for (i = 0; i < data.places.length; i++) {
            dispatch(addPlace(data.places[i]))
          }

        }
      })

  }, [])

  const handleSubmit = () => {
    if (city.length === 0) {
      return;
    }

    fetch(`https://api-adresse.data.gouv.fr/search/?q=${city}`)
      .then((response) => response.json())
      .then((data) => {
        const firstCity = data.features[0];
        const newPlace = {
          name: firstCity.properties.city,
          latitude: firstCity.geometry.coordinates[1],
          longitude: firstCity.geometry.coordinates[0],
        };
        dispatch(addPlace(newPlace));
        setCity('');
        return newPlace;

      })
      .then(data => {
        fetch(`${link}/places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: user.nickname, name: data.name, latitude: data.latitude, longitude: data.longitude })
        })
      });
  };

  function handleDismiss(cityName) {
    dispatch(removePlace(cityName))
    console.log(cityName)
    fetch(`${link}/places`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: user.nickname, name: cityName })
    })
  }

  const places = user.places.map((data, i) => {
    return (
      <View key={i} style={styles.card}>
        <View>
          <Text style={styles.name}>{data.name}</Text>
          <Text>LAT : {Number(data.latitude).toFixed(3)} LON : {Number(data.longitude).toFixed(3)}</Text>
        </View>
        <FontAwesome name='trash-o' onPress={() => handleDismiss(data.name)} size={25} color='#ec6e5b' />
      </View>
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{user.nickname}'s places</Text>

      <View style={styles.inputContainer}>
        <TextInput placeholder="New city" onChangeText={(value) => setCity(value)} value={city} style={styles.input} />
        <TouchableOpacity onPress={() => handleSubmit()} style={styles.button} activeOpacity={0.8}>
          <Text style={styles.textButton}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {places}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 20,
  },
  scrollView: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 20,
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 20,
    borderRadius: 10,
  },
  input: {
    width: '65%',
    marginTop: 6,
    borderBottomColor: '#ec6e5b',
    borderBottomWidth: 1,
    fontSize: 16,
  },
  button: {
    width: '30%',
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: '#ec6e5b',
    borderRadius: 10,
  },
  textButton: {
    color: '#ffffff',
    height: 24,
    fontWeight: '600',
    fontSize: 15,
  },
});
