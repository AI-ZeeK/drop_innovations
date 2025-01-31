import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useGetRidesQuery } from "@/store/api/ridesApi";
import { useSeedRidesMutation } from "@/store/api/ridesApi";
import { successToast, errorToast } from "@/utils/toast";
import { Ride } from "@/store/slices/rideSlice";

export default function RidesScreen() {
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetRidesQuery({
    page,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const [seedRides, { isLoading: isSeeding }] = useSeedRidesMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSeedRides = async () => {
    try {
      await seedRides().unwrap();
      successToast("Success", "Successfully added sample rides");
      refetch();
    } catch (error) {
      errorToast("Error", "Failed to add sample rides");
    }
  };

  const renderRideItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-lg mb-4">
      <Text className="font-bold text-lg mb-2">
        {item.pickup_location} → {item.dropoff_location}
      </Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600">
          ${item.fare.toFixed(2)} • {item.car_type}
        </Text>
        <Text
          className={`${
            item.status === "COMPLETED"
              ? "text-green-600"
              : item.status === "CANCELLED"
              ? "text-red-600"
              : "text-blue-600"
          }`}
        >
          {item.status}
        </Text>
      </View>
      <Text className="text-gray-500 text-sm mt-2">
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Your Rides</Text>
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${
            isSeeding ? "bg-gray-400" : "bg-primary"
          }`}
          onPress={handleSeedRides}
          disabled={isSeeding}
        >
          <Text className="text-white font-semibold">
            {isSeeding ? "Adding..." : "Add Sample Rides"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data as Ride[]}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.ride_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // onEndReached={() => {
        //   if (data && page < data.totalPages) {
        //     setPage(page + 1);
        //   }
        // }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500">No rides found</Text>
          </View>
        }
      />
    </View>
  );
}
