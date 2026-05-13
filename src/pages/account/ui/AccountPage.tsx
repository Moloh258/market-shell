import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  addAddress,
  getCurrentUser,
  getUserAddresses,
  removeAddress,
  updateAddress,
  updateUserProfile,
} from "@/entities/user/api/userApi";
import {
  addressSchema,
  updateUserProfileSchema,
  type AddressFormValues,
  type UpdateUserProfileFormValues,
} from "@/entities/user/model/schemas";
import type {
  Address,
  AddAddressPayload,
  UpdateAddressPayload,
  UpdateUserProfilePayload,
  User,
} from "@/entities/user/model/types";
import { getErrorMessage } from "@/shared/api/errors";
import { queryKeys } from "@/shared/api/queryKeys";

type ProfileFormProps = {
  user: User;
  isSubmitting: boolean;
  onSubmit: (payload: UpdateUserProfilePayload) => void;
};

function ProfileForm({ user, isSubmitting, onSubmit }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserProfileFormValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
    });
  }, [reset, user]);

  return (
    <form
      className="form-grid"
      onSubmit={handleSubmit((values) =>
        onSubmit(updateUserProfileSchema.parse(values)),
      )}
    >
      <label className="field">
        Имя
        <input {...register("name")} />
        {errors.name ? <span>{errors.name.message}</span> : null}
      </label>
      <label className="field">
        Электронная почта
        <input type="email" {...register("email")} />
        {errors.email ? <span>{errors.email.message}</span> : null}
      </label>
      <label className="field">
        Телефон
        <input type="tel" {...register("phone")} />
        {errors.phone ? <span>{errors.phone.message}</span> : null}
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Сохраняем..." : "Сохранить профиль"}
      </button>
    </form>
  );
}

type AddressFormProps = {
  address?: Address;
  submitLabel: string;
  isSubmitting: boolean;
  resetOnSuccess?: boolean;
  onSubmit: (payload: AddAddressPayload) => Promise<unknown> | unknown;
};

function AddressForm({
  address,
  submitLabel,
  isSubmitting,
  resetOnSuccess = false,
  onSubmit,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: address?.fullName ?? "",
      phone: address?.phone ?? "",
      country: address?.country ?? "",
      city: address?.city ?? "",
      street: address?.street ?? "",
      postalCode: address?.postalCode ?? "",
    },
  });

  useEffect(() => {
    reset({
      fullName: address?.fullName ?? "",
      phone: address?.phone ?? "",
      country: address?.country ?? "",
      city: address?.city ?? "",
      street: address?.street ?? "",
      postalCode: address?.postalCode ?? "",
    });
  }, [address, reset]);

  return (
    <form
      className="form-grid"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(addressSchema.parse(values));

        if (resetOnSuccess) {
          reset();
        }
      })}
    >
      <label className="field">
        Получатель
        <input {...register("fullName")} />
        {errors.fullName ? <span>{errors.fullName.message}</span> : null}
      </label>
      <label className="field">
        Телефон
        <input type="tel" {...register("phone")} />
        {errors.phone ? <span>{errors.phone.message}</span> : null}
      </label>
      <label className="field">
        Страна
        <input {...register("country")} />
        {errors.country ? <span>{errors.country.message}</span> : null}
      </label>
      <label className="field">
        Город
        <input {...register("city")} />
        {errors.city ? <span>{errors.city.message}</span> : null}
      </label>
      <label className="field field-wide">
        Улица
        <input {...register("street")} />
        {errors.street ? <span>{errors.street.message}</span> : null}
      </label>
      <label className="field">
        Почтовый индекс
        <input {...register("postalCode")} />
        {errors.postalCode ? <span>{errors.postalCode.message}</span> : null}
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Сохраняем..." : submitLabel}
      </button>
    </form>
  );
}

export function AccountPage() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });
  const addressesQuery = useQuery({
    queryKey: queryKeys.userAddresses,
    queryFn: getUserAddresses,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
  const addAddressMutation = useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userAddresses });
    },
  });
  const updateAddressMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userAddresses });
    },
  });
  const removeAddressMutation = useMutation({
    mutationFn: removeAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userAddresses });
    },
  });

  const isLoading = userQuery.isLoading || addressesQuery.isLoading;
  const error = userQuery.error ?? addressesQuery.error;

  if (isLoading) {
    return (
      <section>
        <h1>Аккаунт</h1>
        <p>Загружаем аккаунт...</p>
      </section>
    );
  }

  if (error || !userQuery.data) {
    return (
      <section>
        <h1>Аккаунт</h1>
        <p role="alert">{getErrorMessage(error)}</p>
      </section>
    );
  }

  const addresses = addressesQuery.data ?? [];

  return (
    <section>
      <h1>Аккаунт</h1>
      <div className="page-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Профиль</h2>
            <p>Тестовые данные текущего покупателя marketplace.</p>
          </div>
          <ProfileForm
            user={userQuery.data}
            isSubmitting={updateProfileMutation.isPending}
            onSubmit={(payload) => updateProfileMutation.mutate(payload)}
          />
          {updateProfileMutation.isError ? (
            <p role="alert">{getErrorMessage(updateProfileMutation.error)}</p>
          ) : null}
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>Адреса</h2>
            <p>
              Управление адресами доставки. Реальная авторизация пока не
              подключена.
            </p>
          </div>

          {addresses.length === 0 ? (
            <p>Сохраненных адресов пока нет.</p>
          ) : (
            <ul className="stack-list">
              {addresses.map((address) => (
                <li key={address.id}>
                  <div className="section-heading">
                    <strong>
                      {address.fullName}
                      {address.isDefault ? " - основной" : ""}
                    </strong>
                    <p>
                      {address.street}, {address.city}, {address.country},{" "}
                      {address.postalCode}
                    </p>
                  </div>
                  <AddressForm
                    address={address}
                    submitLabel="Обновить адрес"
                    isSubmitting={updateAddressMutation.isPending}
                    onSubmit={(payload) =>
                      updateAddressMutation.mutateAsync({
                        id: address.id,
                        ...payload,
                      } satisfies UpdateAddressPayload)
                    }
                  />
                  <button
                    type="button"
                    disabled={removeAddressMutation.isPending}
                    onClick={() => removeAddressMutation.mutate(address.id)}
                  >
                    Удалить адрес
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="section-heading">
            <h2>Добавить адрес</h2>
          </div>
          <AddressForm
            submitLabel="Добавить адрес"
            isSubmitting={addAddressMutation.isPending}
            resetOnSuccess
            onSubmit={(payload) => addAddressMutation.mutateAsync(payload)}
          />

          {addressesQuery.isError ||
          addAddressMutation.isError ||
          updateAddressMutation.isError ||
          removeAddressMutation.isError ? (
            <p role="alert">
              {getErrorMessage(
                addressesQuery.error ??
                  addAddressMutation.error ??
                  updateAddressMutation.error ??
                  removeAddressMutation.error,
              )}
            </p>
          ) : null}
        </section>
      </div>
    </section>
  );
}
