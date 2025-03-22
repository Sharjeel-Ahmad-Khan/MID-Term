import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Switch,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const Tab = createBottomTabNavigator();

// Job Detail Screen
const JobDetailScreen = ({ route, navigation }) => {
  const { job, toggleFavorite, favorites, isDarkMode, jobs } = route.params || {};
  const isFavorite = favorites?.includes(job?.id) || false;
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const relatedJobs = jobs?.filter((j) => j.id !== job?.id && j.category === job?.category)?.slice(0, 3) || [];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.ease, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const RelatedJobItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.relatedJobCard, isDarkMode && styles.darkCard]}
      onPress={() => navigation.push('JobDetail', { job: item, toggleFavorite, favorites, isDarkMode, jobs })}
    >
      <Text style={[styles.jobTitle, isDarkMode && styles.darkText]}>{item.title || 'Untitled'}</Text>
      <Text style={[styles.company, isDarkMode && styles.darkText]}>{item.company || 'Unknown'}</Text>
    </TouchableOpacity>
  );

  if (!job) return null;

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.detailHeader, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{job.title || 'Untitled'}</Text>
      </View>
      <Animated.ScrollView
        style={[styles.detailContent, isDarkMode && styles.darkContent]}
        contentContainerStyle={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <Image source={{ uri: job.image || 'https://via.placeholder.com/300x150' }} style={styles.jobImage} />
        <View style={styles.detailInfo}>
          <Text style={[styles.detailCompany, isDarkMode && styles.darkText]}>{job.company || 'Unknown Company'}</Text>
          <Text style={[styles.detailLocation, isDarkMode && styles.darkText]}>{job.location || 'Unknown Location'}</Text>
          <Text style={styles.detailSalary}>{job.salary || 'Salary not specified'}</Text>
          <Text style={[styles.detailDescription, isDarkMode && styles.darkText]}>
            {job.description || 'No description available.'}
          </Text>
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
            onPress={() => toggleFavorite(job.id)}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color="#fff" />
            <Text style={styles.favoriteButtonText}>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
          {relatedJobs.length > 0 && (
            <View style={styles.relatedJobsSection}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Related Jobs</Text>
              <FlatList
                data={relatedJobs}
                renderItem={RelatedJobItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Job Listings Screen (Updated)
const JobListingsScreen = ({ navigation, jobs, toggleFavorite, favorites, isDarkMode }) => {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    setFilteredJobs(jobs || []);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.ease, useNativeDriver: true }).start();
  }, [jobs, fadeAnim]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterJobs(text, categoryFilter);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    filterJobs(searchQuery, category);
  };

  const filterJobs = (search, category) => {
    let filtered = jobs || [];
    if (search) {
      filtered = filtered.filter((job) =>
        (job?.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (job?.company?.toLowerCase() || '').includes(search.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter((job) => (job?.category?.toLowerCase() || '').includes(category.toLowerCase()));
    }
    setFilteredJobs(filtered);
  };

  const JobItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.jobCard, isDarkMode && styles.darkCard]}
      onPress={() => navigation.navigate('JobDetail', { job: item, toggleFavorite, favorites, isDarkMode, jobs })}
    >
      <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={[styles.jobTitle, isDarkMode && styles.darkText]}>{item.title || 'Untitled'}</Text>
        <Text style={[styles.company, isDarkMode && styles.darkText]}>{item.company || 'Unknown'}</Text>
        <Text style={[styles.location, isDarkMode && styles.darkText]}>{item.location || 'N/A'}</Text>
        <Text style={[styles.description, isDarkMode && styles.darkText]} numberOfLines={2}>
          {item.description || 'No description'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={styles.headerTitle}>Job Listings</Text>
      </View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search jobs..."
          placeholderTextColor={isDarkMode ? '#999' : '#999'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true} // Enabled for visibility
          contentContainerStyle={styles.categoryFilterContainer}
        >
          {['All', 'Tech', 'Marketing', 'Sales'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                isDarkMode && styles.darkCategoryButton,
                categoryFilter === (cat === 'All' ? '' : cat) && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryFilter(cat === 'All' ? '' : cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  isDarkMode && styles.darkText,
                  categoryFilter === (cat === 'All' ? '' : cat) && styles.categoryButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <FlatList
          data={filteredJobs}
          renderItem={JobItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.jobList}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

// Profile Screen
const ProfileScreen = ({ setIsLoggedIn, isDarkMode, toggleDarkMode, username, setUsername, profileImage, setProfileImage }) => {
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(username || '');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  useEffect(() => {
    const loadProfileImage = async () => {
      const storedImage = await AsyncStorage.getItem('profileImage');
      if (storedImage) setProfileImage(storedImage);
    };
    loadProfileImage();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim, setProfileImage]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  const handleSaveUsername = async () => {
    if (newUsername.trim()) {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        const userData = storedUserData ? JSON.parse(storedUserData) : {};
        userData.username = newUsername;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUsername(newUsername);
        setEditMode(false);
      } catch (err) {
        console.error('Error saving username:', err);
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await AsyncStorage.setItem('profileImage', imageUri);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <Animated.ScrollView contentContainerStyle={styles.profileContent} style={{ opacity: fadeAnim }}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          </TouchableOpacity>
          {editMode ? (
            <View style={styles.editProfile}>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="New Username"
                placeholderTextColor={isDarkMode ? '#999' : '#999'}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveUsername}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isDarkMode && styles.darkText]}>{username || 'User'}</Text>
              <Text style={[styles.profileEmail, isDarkMode && styles.darkText]}>
                {username?.toLowerCase().replace(/\s/g, '') || 'user'}@example.com
              </Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.settingsRow}>
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#d1d5db', true: '#f87171' }}
              thumbColor={isDarkMode ? '#ef4444' : '#fff'}
            />
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Home Screen
const HomeScreen = ({ navigation, jobs, loading, error, toggleFavorite, favorites, isDarkMode, username, profileImage }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const JobItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.jobCard, isDarkMode && styles.darkCard]}
      onPress={() => navigation.navigate('JobDetail', { job: item, toggleFavorite, favorites, isDarkMode, jobs })}
    >
      <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={[styles.jobTitle, isDarkMode && styles.darkText]}>{item.title || 'Untitled'}</Text>
        <Text style={[styles.company, isDarkMode && styles.darkText]}>{item.company || 'Unknown'}</Text>
        <Text style={[styles.location, isDarkMode && styles.darkText]}>{item.location || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={styles.headerTitle}>Welcome, {username || 'User'}</Text>
      </View>
      <Animated.ScrollView
        contentContainerStyle={styles.homeContent}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <TouchableOpacity style={[styles.featureCard, isDarkMode && styles.darkCard]} onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: profileImage }} style={styles.featureImage} />
          <Text style={[styles.featureText, isDarkMode && styles.darkText]}>Shargeel Ahmad Khan</Text>
        </TouchableOpacity>
        <View style={styles.jobsSection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Latest Jobs</Text>
          {loading ? (
            <ActivityIndicator size="large" color={isDarkMode ? '#f87171' : '#ef4444'} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={jobs?.slice(0, 3) || []}
              renderItem={JobItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Settings Screen
const SettingsScreen = ({ isDarkMode, toggleDarkMode, jobs }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <Animated.ScrollView contentContainerStyle={styles.settingsContent} style={{ opacity: fadeAnim }}>
        <View style={styles.settingsRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#d1d5db', true: '#f87171' }}
            thumbColor={isDarkMode ? '#ef4444' : '#fff'}
          />
        </View>
        <View style={styles.settingsRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Notifications</Text>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#d1d5db', true: '#f87171' }}
            thumbColor="#ef4444"
          />
        </View>
        <View style={styles.settingsRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Available Jobs: {jobs?.length || 0}</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Feedback Screen
const FeedbackScreen = ({ isDarkMode }) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadFeedback = async () => {
      const storedFeedback = await AsyncStorage.getItem('feedback');
      if (storedFeedback) setFeedbackList(JSON.parse(storedFeedback));
    };
    loadFeedback();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleSubmitFeedback = async () => {
    if (feedback.trim()) {
      try {
        const newFeedback = { text: feedback, date: new Date().toISOString() };
        const updatedList = [...feedbackList, newFeedback];
        await AsyncStorage.setItem('feedback', JSON.stringify(updatedList));
        setFeedbackList(updatedList);
        setFeedback('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
      } catch (err) {
        console.error('Error saving feedback:', err);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={styles.headerTitle}>Feedback</Text>
      </View>
      <Animated.ScrollView contentContainerStyle={styles.feedbackContent} style={{ opacity: fadeAnim }}>
        <Text style={[styles.feedbackLabel, isDarkMode && styles.darkText]}>We’d love to hear your thoughts!</Text>
        <TextInput
          style={[styles.feedbackInput, isDarkMode && styles.darkInput]}
          multiline
          numberOfLines={4}
          placeholder="Enter your feedback here..."
          placeholderTextColor={isDarkMode ? '#999' : '#999'}
          value={feedback}
          onChangeText={setFeedback}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        {submitted && <Text style={styles.successText}>Thank you for your feedback!</Text>}
        {feedbackList.length > 0 && (
          <View style={styles.feedbackHistory}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Previous Feedback</Text>
            {feedbackList.map((item, index) => (
              <Text key={index} style={[styles.feedbackItem, isDarkMode && styles.darkText]}>
                {new Date(item.date).toLocaleDateString()}: {item.text}
              </Text>
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const darkMode = await AsyncStorage.getItem('isDarkMode');
        const userData = await AsyncStorage.getItem('userData');
        const storedImage = await AsyncStorage.getItem('profileImage');
        console.log('Initializing app - LoggedIn:', loggedIn, 'UserData:', userData);
        if (loggedIn === 'true' && userData) {
          setIsLoggedIn(true);
          setUsername(JSON.parse(userData).username || 'User');
          fetchJobs();
        } else {
          setIsLoggedIn(false);
        }
        setIsDarkMode(darkMode === 'true');
        if (storedImage) setProfileImage(storedImage);
      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Failed to load app data');
      }
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    };
    initializeApp();
  }, [fadeAnim]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const data = await response.json();
      const jobData = data.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.body,
        company: `Company ${post.id}`,
        location: 'Remote',
        category: post.id % 2 === 0 ? 'Tech' : 'Marketing',
        salary: '$50,000 - $70,000',
        image: `https://picsum.photos/300/150?random=${post.id}`,
      }));
      setJobs(jobData);
      setError('');
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (username.trim() && password.trim()) {
      try {
        const userData = { username, password };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        console.log('Signup successful - Username:', username);
        setIsLoggedIn(true);
        setError('');
        fetchJobs();
      } catch (err) {
        setError('Signup failed. Please try again.');
        console.error('Signup Error:', err);
      }
    } else {
      setError('Please enter both username and password');
    }
  };

  const handleLogin = async () => {
    if (username.trim() && password.trim()) {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const { username: storedUsername, password: storedPassword } = JSON.parse(storedUserData);
          console.log('Login attempt - Entered:', { username, password }, 'Stored:', { storedUsername, storedPassword });
          if (username === storedUsername && password === storedPassword) {
            await AsyncStorage.setItem('isLoggedIn', 'true');
            setIsLoggedIn(true);
            setError('');
            fetchJobs();
          } else {
            setError('Invalid username or password');
          }
        } else {
          setError('No account found. Please sign up first.');
        }
      } catch (err) {
        setError('Login failed. Please try again.');
        console.error('Login Error:', err);
      }
    } else {
      setError('Please enter both username and password');
    }
  };

  const toggleFavorite = (jobId) => {
    setFavorites((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('isDarkMode', newMode.toString());
    } catch (err) {
      console.error('Error saving dark mode:', err);
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <StatusBar style={isDarkMode ? 'light' : 'light'} backgroundColor={isDarkMode ? '#991b1b' : '#ef4444'} />
        <Animated.View style={[styles.authContainer, isDarkMode && styles.darkAuthContainer, { opacity: fadeAnim }]}>
          <Image source={{ uri: 'https://picsum.photos/100' }} style={styles.authLogo} />
          <Text style={[styles.authTitle, isDarkMode && styles.darkText]}>{isSignup ? 'Sign Up' : 'Login'}</Text>
          <Text style={[styles.authSubtitle, isDarkMode && styles.darkText]}>
            {isSignup ? 'Create an account' : 'Sign in to continue'}
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Username"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#9ca3af'}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#9ca3af'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.authButton} onPress={isSignup ? handleSignup : handleLogin}>
            <Text style={styles.authButtonText}>{isSignup ? 'Sign Up' : 'Login'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => {
              setIsSignup(!isSignup);
              setError('');
              setUsername('');
              setPassword('');
            }}
          >
            <Text style={styles.toggleButtonText}>
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? 'light' : 'light'} backgroundColor={isDarkMode ? '#991b1b' : '#ef4444'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Jobs') iconName = 'briefcase';
            else if (route.name === 'Profile') {
              return <Image source={{ uri: profileImage }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
            } else if (route.name === 'Settings') iconName = 'settings';
            else if (route.name === 'Feedback') iconName = 'chatbubbles';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ef4444',
          tabBarInactiveTintColor: isDarkMode ? '#9ca3af' : '#6b7280',
          tabBarStyle: [styles.tabBar, isDarkMode && styles.darkTabBar],
          headerShown: false,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        })}
      >
        <Tab.Screen
          name="Home"
          children={() => (
            <HomeScreen
              jobs={jobs}
              loading={loading}
              error={error}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
              isDarkMode={isDarkMode}
              username={username}
              profileImage={profileImage}
            />
          )}
        />
        <Tab.Screen
          name="Jobs"
          children={() => (
            <JobListingsScreen jobs={jobs} toggleFavorite={toggleFavorite} favorites={favorites} isDarkMode={isDarkMode} />
          )}
        />
        <Tab.Screen
          name="Profile"
          children={() => (
            <ProfileScreen
              setIsLoggedIn={setIsLoggedIn}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              username={username}
              setUsername={setUsername}
              profileImage={profileImage}
              setProfileImage={setProfileImage}
            />
          )}
          options={{ tabBarLabel: 'My Profile' }}
        />
        <Tab.Screen
          name="Settings"
          children={() => <SettingsScreen isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} jobs={jobs} />}
        />
        <Tab.Screen name="Feedback" children={() => <FeedbackScreen isDarkMode={isDarkMode} />} />
        <Tab.Screen name="JobDetail" component={JobDetailScreen} options={{ tabBarButton: () => null }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  darkContainer: {
    backgroundColor: '#0f172a',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    elevation: 4,
  },
  darkAuthContainer: {
    backgroundColor: '#1e293b',
  },
  authLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  darkInput: {
    backgroundColor: '#475569',
    color: '#f1f5f9',
  },
  authButton: {
    width: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 24,
  },
  toggleButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#ef4444',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    alignItems: 'center',
  },
  darkHeader: {
    backgroundColor: '#991b1b',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  homeContent: {
    padding: 20,
    alignItems: 'center',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    width: '100%',
  },
  darkCard: {
    backgroundColor: '#1e293b',
  },
  featureImage: {
    width: 160,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '600',
  },
  jobsSection: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    marginBottom: 16,
    elevation: 3,
    width: 300,
  },
  relatedJobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 160,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  darkText: {
    color: '#f1f5f9',
  },
  jobList: {
    padding: 20,
    alignItems: 'center',
  },
  searchInput: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    marginHorizontal: '5%',
    fontSize: 16,
    elevation: 2,
  },
  categoryFilterContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    elevation: 2,
    minWidth: 70, // Ensures buttons are wide enough
    alignItems: 'center',
  },
  darkCategoryButton: {
    backgroundColor: '#1e293b',
  },
  categoryButtonActive: {
    backgroundColor: '#ef4444',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 16,
    flex: 1,
  },
  detailContent: {
    flex: 1,
  },
  darkContent: {
    backgroundColor: '#0f172a',
  },
  jobImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  detailInfo: {
    padding: 20,
    alignItems: 'center',
  },
  detailCompany: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
  },
  detailLocation: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  detailSalary: {
    fontSize: 18,
    color: '#22c55e',
    fontWeight: '600',
    marginBottom: 16,
  },
  detailDescription: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  favoriteButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '80%',
  },
  favoriteActive: {
    backgroundColor: '#991b1b',
  },
  applyButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '80%',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  relatedJobsSection: {
    marginTop: 24,
    width: '100%',
  },
  profileContent: {
    padding: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#ef4444',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  editProfile: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#991b1b',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  settingsContent: {
    padding: 20,
    alignItems: 'center',
  },
  feedbackContent: {
    padding: 20,
    alignItems: 'center',
  },
  feedbackLabel: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
    fontWeight: '500',
  },
  feedbackInput: {
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '80%',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  successText: {
    color: '#22c55e',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  feedbackHistory: {
    marginTop: 24,
    width: '100%',
  },
  feedbackItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 8,
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  darkTabBar: {
    backgroundColor: '#1e293b',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
